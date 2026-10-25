import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const translations = {
  'Dashboard': 'డాష్‌బోర్డ్',
  'New screening': 'కొత్త స్క్రీనింగ్',
  'My history': 'నా చరిత్ర',
  'Health insights': 'ఆరోగ్య అంతర్దృష్టులు',
  'Kidney education': 'మూత్రపిండాల విద్య',
  'Profile & settings': 'ప్రొఫైల్ & సెట్టింగులు',
  'Sign out': 'సైన్ అవుట్',
  'PERSONAL HEALTH WORKSPACE': 'వ్యక్తిగత ఆరోగ్య వర్క్‌స్పేస్',
  'Kidney health screening': 'మూత్రపిండాల ఆరోగ్య స్క్రీనింగ్',
  'Welcome back': 'మళ్లీ స్వాగతం',
  'Sign in to continue your health screening.': 'మీ ఆరోగ్య స్క్రీనింగ్ కొనసాగించడానికి సైన్ ఇన్ చేయండి.',
  'Email': 'ఇమెయిల్',
  'Password': 'పాస్‌వర్డ్',
  'New here?': 'ఇక్కడ కొత్తవారా?',
  'Create an account': 'ఖాతా సృష్టించండి',
  'Create your account': 'మీ ఖాతాను సృష్టించండి',
  'Start monitoring your kidney health.': 'మీ మూత్రపిండాల ఆరోగ్యాన్ని పర్యవేక్షించడం ప్రారంభించండి.',
  'Name': 'పేరు',
  'Create account': 'ఖాతా సృష్టించండి',
  'Already registered?': 'ఇప్పటికే నమోదు చేసుకున్నారా?',
  'OVERVIEW': 'అవలోకనం',
  'Total screenings': 'మొత్తం స్క్రీనింగ్‌లు',
  'CKD-positive predictions': 'CKD పాజిటివ్ అంచనాలు',
  'Recent activity': 'ఇటీవలి కార్యకలాపం',
  'Risk distribution': 'ప్రమాద పంపిణీ',
  'Low': 'తక్కువ',
  'Medium': 'మధ్యస్థం',
  'High': 'అధికం',
  'Start a screening': 'స్క్రీనింగ్ ప్రారంభించండి',
  'No screenings yet.': 'ఇంకా స్క్రీనింగ్‌లు లేవు.',
  'NEW SCREENING': 'కొత్త స్క్రీనింగ్',
  'Let’s understand your kidney health.': 'మీ మూత్రపిండాల ఆరోగ్యాన్ని అర్థం చేసుకుందాం.',
  'Manual entry': 'మాన్యువల్ నమోదు',
  'Upload report': 'రిపోర్ట్ అప్‌లోడ్',
  'Not provided': 'అందించలేదు',
  'Basic measurements': 'ప్రాథమిక కొలతలు',
  'Blood and urine results': 'రక్తం మరియు మూత్ర ఫలితాలు',
  'Clinical indicators': 'క్లినికల్ సూచికలు',
  'Optional': 'ఐచ్ఛికం',
  'Choose if known': 'తెలిస్తే ఎంచుకోండి',
  'Upload a lab report': 'ల్యాబ్ రిపోర్ట్ అప్‌లోడ్ చేయండి',
  'Choose PDF report': 'PDF రిపోర్ట్ ఎంచుకోండి',
  'Continue manually': 'మాన్యువల్‌గా కొనసాగించండి',
  'Run screening →': 'స్క్రీనింగ్ ప్రారంభించండి →',
  'Analyzing…': 'విశ్లేషిస్తోంది…',
  'SCREENING COMPLETE': 'స్క్రీనింగ్ పూర్తయింది',
  'Your kidney health snapshot.': 'మీ మూత్రపిండాల ఆరోగ్య సారాంశం.',
  'CKD probability': 'CKD సంభావ్యత',
  'Prediction': 'అంచనా',
  'Not CKD': 'CKD కాదు',
  'Risk level': 'ప్రమాద స్థాయి',
  'AI PREDICTION EXPLANATION': 'AI అంచనా వివరణ',
  'What influenced this estimate?': 'ఈ అంచనాను ప్రభావితం చేసిన అంశాలు ఏమిటి?',
  'Model explanation': 'మోడల్ వివరణ',
  'Pushes probability higher': 'సంభావ్యతను పెంచుతుంది',
  'Pushes probability lower': 'సంభావ్యతను తగ్గిస్తుంది',
  'higher probability': 'అధిక సంభావ్యత',
  'lower probability': 'తక్కువ సంభావ్యత',
  'Top contributing factors': 'ప్రధాన ప్రభావిత అంశాలు',
  'Your value:': 'మీ విలువ:',
  'Important:': 'ముఖ్యమైనది:',
  'Need to check another set of values?': 'మరొక విలువల సమూహాన్ని తనిఖీ చేయాలా?',
  'New screening →': 'కొత్త స్క్రీనింగ్ →',
  'Prediction history': 'అంచనాల చరిత్ర',
  'View details': 'వివరాలు చూడండి',
  'Delete': 'తొలగించండి',
  'Clear filters': 'ఫిల్టర్‌లను క్లియర్ చేయండి',
  'All levels': 'అన్ని స్థాయిలు',
  'Date': 'తేదీ',
  'Risk': 'ప్రమాదం',
  'Compare screenings': 'స్క్రీనింగ్‌లను పోల్చండి',
  'Clear selection': 'ఎంపికను క్లియర్ చేయండి',
  'HEALTH INSIGHTS': 'ఆరోగ్య అంతర్దృష్టులు',
  'Lab value trend': 'ల్యాబ్ విలువ ధోరణి',
  'Creatinine': 'క్రియాటినిన్',
  'Blood urea': 'రక్త యూరియా',
  'Hemoglobin': 'హిమోగ్లోబిన్',
  'Blood pressure': 'రక్తపోటు',
  'Probability and risk': 'సంభావ్యత మరియు ప్రమాదం',
  'See what changed': 'ఏమి మారిందో చూడండి',
  'Select two screenings': 'రెండు స్క్రీనింగ్‌లను ఎంచుకోండి',
  'KIDNEY HEALTH EDUCATION': 'మూత్రపిండాల ఆరోగ్య విద్య',
  'Small steps can support kidney health.': 'చిన్న అడుగులు మూత్రపిండాల ఆరోగ్యానికి సహాయపడతాయి.',
  'What is chronic kidney disease?': 'దీర్ఘకాలిక మూత్రపిండాల వ్యాధి అంటే ఏమిటి?',
  'Possible symptoms': 'సంభవించే లక్షణాలు',
  'Common risk factors': 'సాధారణ ప్రమాద కారకాలు',
  'What common kidney tests tell you': 'సాధారణ మూత్రపిండాల పరీక్షలు ఏమి చెబుతాయి',
  'Healthy lifestyle habits': 'ఆరోగ్యకరమైన జీవనశైలి అలవాట్లు',
  'Learn more from trusted sources': 'విశ్వసనీయ వనరుల నుండి మరింత తెలుసుకోండి',
  'PROFILE & SETTINGS': 'ప్రొఫైల్ & సెట్టింగులు',
  'Manage your RenalCare account.': 'మీ RenalCare ఖాతాను నిర్వహించండి.',
  'PERSONAL DETAILS': 'వ్యక్తిగత వివరాలు',
  'Your profile': 'మీ ప్రొఫైల్',
  'Full name': 'పూర్తి పేరు',
  'Email address': 'ఇమెయిల్ చిరునామా',
  'Account preferences': 'ఖాతా ప్రాధాన్యతలు',
  'Product updates': 'ఉత్పత్తి నవీకరణలు',
  'Health reminders': 'ఆరోగ్య రిమైండర్‌లు',
  'Save changes': 'మార్పులను సేవ్ చేయండి',
  'ACCOUNT SECURITY': 'ఖాతా భద్రత',
  'Change password': 'పాస్‌వర్డ్ మార్చండి',
  'Current password': 'ప్రస్తుత పాస్‌వర్డ్',
  'New password': 'కొత్త పాస్‌వర్డ్',
  'Confirm new password': 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి',
  'Update password': 'పాస్‌వర్డ్ నవీకరించండి',
  'DANGER ZONE': 'ప్రమాద విభాగం',
  'Delete account': 'ఖాతాను తొలగించండి',
  'English': 'ఇంగ్లీష్',
  'Telugu': 'తెలుగు',
  'Language': 'భాష',
  '☾ Dark': '☾ డార్క్',
  '☀ Light': '☀ లైట్',
  'Switch to dark mode': 'డార్క్ మోడ్‌కు మార్చండి',
  'Switch to light mode': 'లైట్ మోడ్‌కు మార్చండి',
  'Age': 'వయస్సు',
  'Specific gravity': 'స్పెసిఫిక్ గ్రావిటీ',
  'Albumin': 'ఆల్బుమిన్',
  'Sugar': 'చక్కెర',
  'Red blood cells': 'ఎర్ర రక్త కణాలు',
  'Pus cell': 'చీము కణం',
  'Pus cell clumps': 'చీము కణాల గుంపులు',
  'Bacteria': 'బ్యాక్టీరియా',
  'Blood glucose': 'రక్త గ్లూకోజ్',
  'Sodium': 'సోడియం',
  'Potassium': 'పొటాషియం',
  'Packed cell volume': 'ప్యాక్డ్ సెల్ వాల్యూమ్',
  'White cell count': 'తెల్ల రక్త కణాల సంఖ్య',
  'Red cell count': 'ఎర్ర రక్త కణాల సంఖ్య',
  'Hypertension': 'అధిక రక్తపోటు',
  'Diabetes mellitus': 'మధుమేహం',
  'Coronary artery disease': 'కరోనరీ ఆర్టరీ వ్యాధి',
  'Appetite': 'ఆకలి',
  'Pedal edema': 'పాదాల వాపు',
  'Anemia': 'రక్తహీనత',
  'normal': 'సాధారణం',
  'abnormal': 'అసాధారణం',
  'present': 'ఉంది',
  'notpresent': 'లేదు',
  'yes': 'అవును',
  'no': 'కాదు',
  'good': 'మంచిది',
  'poor': 'తక్కువ',
  'Tiredness or trouble concentrating': 'అలసట లేదా ఏకాగ్రతలో ఇబ్బంది',
  'Swelling in the feet, ankles, or around the eyes': 'పాదాలు, చీలమండలు లేదా కళ్ల చుట్టూ వాపు',
  'Changes in how often you urinate': 'మూత్ర విసర్జన తరచుదనంలో మార్పులు',
  'Poor appetite, nausea, or muscle cramps': 'ఆకలి తగ్గడం, వికారం లేదా కండరాల తిమ్మిరి',
  'Dry, itchy skin or sleep problems': 'పొడి, దురద చర్మం లేదా నిద్ర సమస్యలు',
  'Diabetes': 'మధుమేహం',
  'High blood pressure': 'అధిక రక్తపోటు',
  'Heart disease': 'గుండె జబ్బు',
  'Family history': 'కుటుంబ చరిత్ర',
  'Older age or prior kidney injury': 'వయస్సు పెరగడం లేదా గతంలో మూత్రపిండాల గాయం',
  'Serum creatinine': 'సీరం క్రియాటినిన్',
  'Urine albumin': 'మూత్ర ఆల్బుమిన్',
  'A single number is not enough to diagnose CKD.': 'ఒకే సంఖ్యతో CKD నిర్ధారణ చేయలేం.',
  'The basics': 'ప్రాథమిక విషయాలు',
  'KNOW THE SIGNS': 'లక్షణాలను తెలుసుకోండి',
  'UNDERSTAND YOUR RISK': 'మీ ప్రమాదాన్ని అర్థం చేసుకోండి',
  'LAB TEST GUIDE': 'ల్యాబ్ పరీక్షల మార్గదర్శి',
  'EVERYDAY SUPPORT': 'రోజువారీ సహాయం',
  'Ask your clinician about your results': 'మీ ఫలితాల గురించి వైద్యుడిని అడగండి',
  'Loading your account settings...': 'మీ ఖాతా సెట్టింగులను లోడ్ చేస్తోంది...',
  'No health insights yet': 'ఇంకా ఆరోగ్య అంతర్దృష్టులు లేవు',
  'Run a prediction': 'అంచనాను అమలు చేయండి',
  'Unable to load your profile': 'మీ ప్రొఫైల్‌ను లోడ్ చేయలేకపోయాం',
  'Profile and preferences saved.': 'ప్రొఫైల్ మరియు ప్రాధాన్యతలు సేవ్ అయ్యాయి.',
  'Password updated successfully.': 'పాస్‌వర్డ్ విజయవంతంగా నవీకరించబడింది.',
  'Average probability': 'సగటు సంభావ్యత',
  'Across all screenings': 'అన్ని స్క్రీనింగ్‌లలో',
  'CKD-positive': 'CKD పాజిటివ్',
  'High-risk results': 'అధిక ప్రమాద ఫలితాలు',
  'All-time screenings': 'మొత్తం స్క్రీనింగ్‌లు',
  'Review with a clinician': 'వైద్యుడితో సమీక్షించండి',
  'Complete a screening to see your probability trend.': 'మీ సంభావ్యత ధోరణిని చూడటానికి స్క్రీనింగ్ పూర్తి చేయండి.',
  'No risk data yet.': 'ఇంకా ప్రమాద డేటా లేదు.',
  'Your screening activity will appear here.': 'మీ స్క్రీనింగ్ కార్యకలాపం ఇక్కడ కనిపిస్తుంది.',
  'CKD-positive screening': 'CKD పాజిటివ్ స్క్రీనింగ్',
  'Not CKD screening': 'CKD కాదు స్క్రీనింగ్',
  'probability': 'సంభావ్యత',
  'Probability': 'సంభావ్యత',
  'screenings': 'స్క్రీనింగ్‌లు',
  'screening': 'స్క్రీనింగ్',
  'shown': 'చూపబడింది',
  'From': 'నుండి',
  'Earlier': 'ముందు',
  'Later': 'తర్వాత',
  'Your CKD probability': 'మీ CKD సంభావ్యత',
  'was not recorded in both screenings.': 'రెండు స్క్రీనింగ్‌లలో నమోదు కాలేదు.',
  'stayed about the same.': 'దాదాపు అలాగే ఉంది.',
  'increased': 'పెరిగింది',
  'decreased': 'తగ్గింది',
  'from': 'నుండి',
  'to': 'కు',
  'This lab value was not recorded in the selected screenings.': 'ఎంచుకున్న స్క్రీనింగ్‌లలో ఈ ల్యాబ్ విలువ నమోదు కాలేదు.',
  'Delete your account and all saved screenings? This cannot be undone.': 'మీ ఖాతా మరియు సేవ్ చేసిన అన్ని స్క్రీనింగ్‌లను తొలగించాలా? దీన్ని తిరిగి మార్చలేరు.',
  'Update your personal details, security, and communication preferences.': 'మీ వ్యక్తిగత వివరాలు, భద్రత మరియు కమ్యూనికేషన్ ప్రాధాన్యతలను నవీకరించండి.',
  'Receive occasional RenalCare account and feature updates.': 'RenalCare ఖాతా మరియు ఫీచర్ నవీకరణలను అప్పుడప్పుడు పొందండి.',
  'Allow reminders about reviewing your saved screening history.': 'మీ సేవ్ చేసిన స్క్రీనింగ్ చరిత్రను సమీక్షించడానికి రిమైండర్‌లను అనుమతించండి.',
  'Use at least 8 characters. Your current password is required to make this change.': 'కనీసం 8 అక్షరాలు ఉపయోగించండి. ఈ మార్పు కోసం మీ ప్రస్తుత పాస్‌వర్డ్ అవసరం.',
  'This permanently deletes your account and all saved screening history. This action cannot be undone.': 'ఇది మీ ఖాతా మరియు సేవ్ చేసిన మొత్తం స్క్రీనింగ్ చరిత్రను శాశ్వతంగా తొలగిస్తుంది. ఈ చర్యను తిరిగి మార్చలేరు.',
  'Enter your password': 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
  'Password for account deletion': 'ఖాతా తొలగింపు కోసం పాస్‌వర్డ్',
  'Actions': 'చర్యలు',
  'No result yet': 'ఇంకా ఫలితం లేదు',
  'Unable to log in': 'లాగిన్ చేయలేకపోయాం',
  'Unable to register': 'నమోదు చేయలేకపోయాం',
  'Unable to load dashboard activity': 'డాష్‌బోర్డ్ కార్యకలాపాన్ని లోడ్ చేయలేకపోయాం',
  'Unable to load health insights': 'ఆరోగ్య అంతర్దృష్టులను లోడ్ చేయలేకపోయాం',
  'Unable to delete prediction': 'అంచనాను తొలగించలేకపోయాం',
  'Unable to load prediction history': 'అంచనా చరిత్రను లోడ్ చేయలేకపోయాం',
  'Unable to change your password': 'మీ పాస్‌వర్డ్‌ను మార్చలేకపోయాం',
  'Unable to save your profile': 'మీ ప్రొఫైల్‌ను సేవ్ చేయలేకపోయాం',
  '+ New screening': '+ కొత్త స్క్రీనింగ్',
  'Report name attached': 'రిపోర్ట్ పేరు జతచేయబడింది',
  'Preparing OCR…': 'OCR సిద్ధం చేస్తోంది…',
  'Values extracted — review them below before running the screening.': 'విలువలు తీసుకోబడ్డాయి — స్క్రీనింగ్ ప్రారంభించే ముందు కింద సమీక్షించండి.',
  'View extracted report text': 'తీసిన రిపోర్ట్ టెక్స్ట్ చూడండి',
  'There was a problem reading this report.': 'ఈ రిపోర్ట్ చదవడంలో సమస్య ఏర్పడింది.',
  'Unable to read that image.': 'ఆ చిత్రాన్ని చదవలేకపోయాం.',
  'Please upload a PDF lab report. Images and other file formats are not supported.': 'దయచేసి PDF ల్యాబ్ రిపోర్ట్ అప్‌లోడ్ చేయండి. చిత్రాలు మరియు ఇతర ఫైల్ ఫార్మాట్‌లకు మద్దతు లేదు.',
  'Choose a PDF lab report.': 'PDF ల్యాబ్ రిపోర్ట్ ఎంచుకోండి.',
  'Extracting text': 'టెక్స్ట్ తీస్తోంది',
  'Reading report': 'రిపోర్ట్ చదువుతోంది',
  'Processing page': 'పేజీని ప్రాసెస్ చేస్తోంది',
  'No screenings yet': 'ఇంకా స్క్రీనింగ్‌లు లేవు',
  'Chronic kidney disease (CKD) means the kidneys are damaged or are not filtering blood as well as expected for three months or more. The kidneys help remove waste, balance fluids, and support blood pressure and red blood cell production.': 'దీర్ఘకాలిక మూత్రపిండాల వ్యాధి (CKD) అంటే మూత్రపిండాలు దెబ్బతినడం లేదా మూడు నెలలు లేదా అంతకంటే ఎక్కువ కాలం రక్తాన్ని సరిగా వడపోయలేకపోవడం. మూత్రపిండాలు వ్యర్థాలను తొలగించడం, ద్రవాలను సమతుల్యం చేయడం, రక్తపోటు మరియు ఎర్ర రక్త కణాల ఉత్పత్తికి సహాయపడతాయి.',
  'CKD can develop slowly and may not cause noticeable symptoms early. Testing is important when someone has risk factors, even if they feel well.': 'CKD నెమ్మదిగా అభివృద్ధి చెందవచ్చు మరియు ప్రారంభంలో స్పష్టమైన లక్షణాలు కనిపించకపోవచ్చు. ఆరోగ్యంగా అనిపించినా ప్రమాద కారకాలు ఉన్నప్పుడు పరీక్షలు ముఖ్యం.',
  'Many people have no symptoms at first. These signs can have many causes, so they do not diagnose CKD by themselves.': 'చాలా మందికి మొదట్లో లక్షణాలు ఉండవు. ఈ సంకేతాలకు అనేక కారణాలు ఉండవచ్చు, కాబట్టి ఇవి ఒక్కటే CKD నిర్ధారణ చేయవు.',
  'New or severe symptoms deserve medical attention. Sudden shortness of breath, chest pain, confusion, or very little urine should be treated as urgent.': 'కొత్తగా లేదా తీవ్రమైన లక్షణాలు ఉంటే వైద్య సహాయం తీసుకోండి. అకస్మాత్తుగా శ్వాస తీసుకోవడంలో ఇబ్బంది, ఛాతీ నొప్పి, గందరగోళం లేదా చాలా తక్కువ మూత్రం అత్యవసరంగా పరిగణించాలి.',
  'High blood sugar can damage the small blood vessels that filter your blood.': 'అధిక రక్త చక్కెర రక్తాన్ని వడపోసే చిన్న రక్తనాళాలను దెబ్బతీయవచ్చు.',
  'Pressure that stays high can strain and damage kidney blood vessels.': 'ఎక్కువగా ఉండే రక్తపోటు మూత్రపిండాల రక్తనాళాలపై ఒత్తిడి చేసి దెబ్బతీయవచ్చు.',
  'Kidney and heart health are closely connected.': 'మూత్రపిండాలు మరియు గుండె ఆరోగ్యం పరస్పరం దగ్గరగా అనుసంధానమై ఉంటాయి.',
  'A close relative with kidney disease may increase your risk.': 'దగ్గరి బంధువుకు మూత్రపిండాల వ్యాధి ఉంటే మీ ప్రమాదం పెరగవచ్చు.',
  'Risk can increase with age or after certain kidney problems.': 'వయస్సుతో లేదా కొన్ని మూత్రపిండాల సమస్యల తర్వాత ప్రమాదం పెరగవచ్చు.',
  'A blood measurement of a waste product. Your clinician uses it with other information to estimate kidney filtering.': 'వ్యర్థ పదార్థం యొక్క రక్త కొలత. మూత్రపిండాల వడపోతను అంచనా వేయడానికి వైద్యుడు దీనిని ఇతర సమాచారంతో ఉపయోగిస్తారు.',
  'An estimated filtration rate calculated from blood test results and personal factors. Trends over time are often more useful than one result alone.': 'రక్త పరీక్ష ఫలితాలు మరియు వ్యక్తిగత అంశాల ఆధారంగా లెక్కించే అంచనా వడపోత రేటు. ఒక ఫలితం కంటే కాలక్రమేణా మార్పులు తరచుగా ఉపయోగకరంగా ఉంటాయి.',
  'Albumin in urine can be a sign that the kidney filters are allowing protein to pass through.': 'మూత్రంలో ఆల్బుమిన్ ఉండటం మూత్రపిండాల వడపోతల ద్వారా ప్రోటీన్ బయటకు వెళ్తున్న సంకేతం కావచ్చు.',
  'Regular checks help identify a major, treatable risk factor for kidney disease.': 'క్రమం తప్పకుండా పరీక్షించడం ద్వారా చికిత్స చేయగల ప్రధాన మూత్రపిండాల వ్యాధి ప్రమాద కారకాన్ని గుర్తించవచ్చు.',
  'The best plan depends on your health and kidney function. Start with changes you can maintain and get personalized advice.': 'ఉత్తమ ప్రణాళిక మీ ఆరోగ్యం మరియు మూత్రపిండాల పనితీరుపై ఆధారపడి ఉంటుంది. కొనసాగించగల మార్పులతో ప్రారంభించి వ్యక్తిగత సలహా పొందండి.',
  'This page summarizes public guidance from national health organizations. It is not a substitute for medical care.': 'ఈ పేజీ జాతీయ ఆరోగ్య సంస్థల ప్రజా మార్గదర్శకాలను సంక్షిప్తంగా అందిస్తుంది. ఇది వైద్య సంరక్షణకు ప్రత్యామ్నాయం కాదు.',
  'Your health at a glance.': 'మీ ఆరోగ్యం ఒక చూపులో.',
  'Track your CKD screening activity and understand your recent risk patterns.': 'మీ CKD స్క్రీనింగ్ కార్యకలాపాలను ట్రాక్ చేసి ఇటీవలి ప్రమాద ధోరణులను అర్థం చేసుకోండి.',
  'Loading your dashboard...': 'మీ డాష్‌బోర్డ్‌ను లోడ్ చేస్తోంది...',
  'SCREENING TREND': 'స్క్రీనింగ్ ధోరణి',
  'CKD probability over time': 'కాలక్రమేణా CKD సంభావ్యత',
  'Last 8 screenings': 'చివరి 8 స్క్రీనింగ్‌లు',
  'RISK PROFILE': 'ప్రమాద ప్రొఫైల్',
  'ACTIVITY': 'కార్యకలాపం',
  'Screenings by day': 'రోజువారీ స్క్రీనింగ్‌లు',
  'RECENT ACTIVITY': 'ఇటీవలి కార్యకలాపం',
  'Latest screenings': 'తాజా స్క్రీనింగ్‌లు',
  'View all': 'అన్నీ చూడండి',
  'Understand your screening trends.': 'మీ స్క్రీనింగ్ ధోరణులను అర్థం చేసుకోండి.',
  'Explore saved results over time and compare changes in your CKD probability and lab values.': 'సేవ్ చేసిన ఫలితాలను కాలక్రమేణా పరిశీలించి CKD సంభావ్యత మరియు ల్యాబ్ విలువల మార్పులను పోల్చండి.',
  'Loading your saved screening data...': 'మీ సేవ్ చేసిన స్క్రీనింగ్ డేటాను లోడ్ చేస్తోంది...',
  'Complete a screening to see your CKD probability and lab value trends here.': 'మీ CKD సంభావ్యత మరియు ల్యాబ్ విలువ ధోరణులను చూడటానికి స్క్రీనింగ్ పూర్తి చేయండి.',
  'LAB VALUE TREND': 'ల్యాబ్ విలువ ధోరణి',
  'Values are taken from your saved screenings. Missing values stay blank.': 'విలువలు మీ సేవ్ చేసిన స్క్రీనింగ్‌ల నుండి తీసుకోబడ్డాయి. లేని విలువలు ఖాళీగా ఉంటాయి.',
  'SCREENING HISTORY': 'స్క్రీనింగ్ చరిత్ర',
  'How the model’s CKD probability has changed.': 'మోడల్ CKD సంభావ్యత ఎలా మారిందో చూడండి.',
  'COMPARE SCREENINGS': 'స్క్రీనింగ్‌లను పోల్చండి',
  'Choose two records for a simple comparison.': 'సులభమైన పోలిక కోసం రెండు రికార్డులను ఎంచుకోండి.',
  'PREDICTION DETAILS': 'అంచనా వివరాలు',
  'Close details': 'వివరాలను మూసివేయండి',
  'No factor details were saved for this prediction.': 'ఈ అంచనాకు అంశాల వివరాలు సేవ్ కాలేదు.',
  'Download PDF': 'PDF డౌన్‌లోడ్ చేయండి',
  'Review and download your previous kidney health screenings.': 'మీ గత మూత్రపిండాల ఆరోగ్య స్క్రీనింగ్‌లను సమీక్షించి డౌన్‌లోడ్ చేయండి.',
  'Loading prediction history...': 'అంచనా చరిత్రను లోడ్ చేస్తోంది...',
  'No predictions match your filters.': 'మీ ఫిల్టర్‌లకు సరిపోయే అంచనాలు లేవు.',
  'Deleting...': 'తొలగిస్తోంది...',
  'Review extracted values before submitting. Blank fields use model defaults.': 'సమర్పించే ముందు తీసిన విలువలను సమీక్షించండి. ఖాళీ ఫీల్డ్‌లు మోడల్ డిఫాల్ట్‌లను ఉపయోగిస్తాయి.',
  'You can also enter values without a report.': 'రిపోర్ట్ లేకుండానే విలువలను నమోదు చేయవచ్చు.',
  'Review the contributing factors below.': 'కింద ఉన్న ప్రభావిత అంశాలను సమీక్షించండి.',
  'This explanation uses SHAP values from the same CKD model that produced your prediction.': 'ఈ వివరణ మీ అంచనాను రూపొందించిన అదే CKD మోడల్‌ యొక్క SHAP విలువలను ఉపయోగిస్తుంది.',
  'This factor contributed toward a higher estimated CKD probability.': 'ఈ అంశం అంచనా వేసిన CKD సంభావ్యత పెరగడానికి దోహదపడింది.',
  'This factor contributed toward a lower estimated CKD probability.': 'ఈ అంశం అంచనా వేసిన CKD సంభావ్యత తగ్గడానికి దోహదపడింది.',
}

const LanguageContext = createContext(null)
const originalTextNodes = new WeakMap()

function translateText(value, language) {
  if (language === 'en') return value
  const trimmed = value.trim()
  const translated = translations[trimmed]
  if (translated) return value.replace(trimmed, translated)
  const screeningCount = trimmed.match(/^(\d+) screenings? shown$/)
  if (screeningCount) return value.replace(trimmed, `${screeningCount[1]} స్క్రీనింగ్‌లు చూపబడ్డాయి`)
  const screeningPercent = trimmed.match(/^(\d+)% of screenings$/)
  if (screeningPercent) return value.replace(trimmed, `స్క్రీనింగ్‌లలో ${screeningPercent[1]}%`)
  const lastScreenings = trimmed.match(/^Last (\d+) screenings$/)
  if (lastScreenings) return value.replace(trimmed, `చివరి ${lastScreenings[1]} స్క్రీనింగ్‌లు`)
  const probabilityValue = trimmed.match(/^(.+)% probability$/)
  if (probabilityValue) return value.replace(trimmed, `${probabilityValue[1]}% సంభావ్యత`)
  return value
}

function translateDocument(language) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    if (!node.parentElement || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(node.parentElement.tagName)) return
    const original = originalTextNodes.get(node) || node.nodeValue
    originalTextNodes.set(node, original)
    node.nodeValue = translateText(original, language)
  })
  document.querySelectorAll('input[placeholder], input[aria-label], button[title]').forEach((element) => {
    ;['placeholder', 'aria-label', 'title'].forEach((attribute) => {
      const original = element.dataset[`renalcare${attribute}`] || element.getAttribute(attribute)
      if (!original) return
      element.dataset[`renalcare${attribute}`] = original
      element.setAttribute(attribute, translateText(original, language))
    })
  })
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('renalcare-language') || 'en')
  const value = useMemo(() => ({
    language,
    setLanguage: (next) => {
      localStorage.setItem('renalcare-language', next)
      setLanguage(next)
    },
  }), [language])

  useEffect(() => {
    translateDocument(language)
    const observer = new MutationObserver(() => translateDocument(language))
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  return <label className="auth-language-switcher">Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="te">తెలుగు</option></select></label>
}
