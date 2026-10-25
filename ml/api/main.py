from pathlib import Path
import pickle
from typing import Any

import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, field_validator


MLFILE_DIR = Path(__file__).resolve().parents[1] / "mlfile"

with (MLFILE_DIR / "model_lgb.pkl").open("rb") as model_file:
    model = pickle.load(model_file)

with (MLFILE_DIR / "preprocessing.pkl").open("rb") as preprocessing_file:
    preprocessing = pickle.load(preprocessing_file)

explainer = shap.TreeExplainer(model)
feature_columns = preprocessing["feature_columns"]
num_cols = preprocessing["num_cols"]
cat_cols = preprocessing["cat_cols"]


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    age: float | str | None = None
    bp: float | str | None = None
    sg: float | str | None = None
    al: float | str | None = None
    su: float | str | None = None
    rbc: str | None = None
    pc: str | None = None
    pcc: str | None = None
    ba: str | None = None
    bgr: float | str | None = None
    bu: float | str | None = None
    sc: float | str | None = None
    sod: float | str | None = None
    pot: float | str | None = None
    hemo: float | str | None = None
    pcv: float | str | None = None
    wc: float | str | None = None
    rc: float | str | None = None
    htn: str | None = None
    dm: str | None = None
    cad: str | None = None
    appet: str | None = None
    pe: str | None = None
    ane: str | None = None

    @field_validator("*", mode="before")
    @classmethod
    def normalize_missing_values(cls, value: Any) -> Any:
        if isinstance(value, str):
            value = value.strip()
            if value in {"", "?"}:
                return None
        return value


class FeatureImpact(BaseModel):
    name: str
    value: Any
    impact: float


class PredictionResponse(BaseModel):
    probability: float
    prediction: int
    risk_level: str
    top_features: list[FeatureImpact]


app = FastAPI(title="Chronic Kidney Disease Prediction API")


def prepare_features(request: PredictionRequest) -> Any:
    values = request.model_dump()
    features = pd.DataFrame([values], columns=feature_columns)
    features = features.map(
        lambda value: value.strip() if isinstance(value, str) else value
    )
    features = features.replace("?", np.nan)
    features[num_cols] = features[num_cols].apply(pd.to_numeric, errors="coerce")
    features[num_cols] = features[num_cols].fillna(preprocessing["num_medians"])
    features[cat_cols] = features[cat_cols].fillna(preprocessing["cat_modes"])
    features[cat_cols] = preprocessing["encoder"].transform(features[cat_cols])
    return preprocessing["scaler"].transform(features)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    prepared_features = prepare_features(request)
    probability = float(model.predict_proba(prepared_features)[0, 1])
    prediction = int(probability >= 0.5)
    if probability < 0.33:
        risk_level = "Low"
    elif probability < 0.66:
        risk_level = "Medium"
    else:
        risk_level = "High"
    shap_values = explainer.shap_values(prepared_features)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    elif shap_values.ndim == 3:
        shap_values = shap_values[:, :, 1]
    patient_shap_values = np.asarray(shap_values)[0]
    patient_values = request.model_dump()
    top_feature_indexes = np.argsort(np.abs(patient_shap_values))[::-1][:5]
    top_features = [
        FeatureImpact(
            name=feature_columns[index],
            value=patient_values[feature_columns[index]],
            impact=float(patient_shap_values[index]),
        )
        for index in top_feature_indexes
    ]

    return PredictionResponse(
        probability=probability,
        prediction=prediction,
        risk_level=risk_level,
        top_features=top_features,
    )
