import os
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Any, List

import json

# Initialize Firebase
CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-adminsdk.json")
FIREBASE_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

try:
    if not firebase_admin._apps:
        if FIREBASE_JSON:
            try:
                cred_dict = json.loads(FIREBASE_JSON)
                cred = credentials.Certificate(cred_dict)
                print("Using Firebase credentials from environment variable.")
            except Exception as e:
                print(f"Failed to parse Firebase JSON from environment: {e}")
                cred = credentials.Certificate(CREDENTIALS_PATH)
        else:
            cred = credentials.Certificate(CREDENTIALS_PATH)
            
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    FIREBASE_ENABLED = True
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Failed to initialize Firebase: {e}")
    FIREBASE_ENABLED = False

def save_query(query_id: str, raw_query: str):
    if not FIREBASE_ENABLED: return
    try:
        db.collection("queries").document(query_id).set({
            "original_query": raw_query,
            "status": "processing",
            "timestamp": firestore.SERVER_TIMESTAMP
        })
    except Exception as e:
        print(f"Error saving query: {e}")

def update_query_status(query_id: str, status: str, result_data: Dict[str, Any] = None):
    if not FIREBASE_ENABLED: return
    try:
        update_doc = {"status": status}
        if result_data:
            update_doc.update(result_data)
            
        db.collection("queries").document(query_id).update(update_doc)
    except Exception as e:
        print(f"Error updating query: {e}")

def save_report(query_id: str, report_data: Dict[str, Any]):
    """Store final report JSON"""
    if not FIREBASE_ENABLED: return
    try:
         db.collection("reports").document(query_id).set(report_data)
    except Exception as e:
         print(f"Error saving report: {e}")

def save_sources(query_id: str, sources: List[Dict[str, Any]]):
    if not FIREBASE_ENABLED: return
    try:
         batch = db.batch()
         for i, source in enumerate(sources):
              doc_ref = db.collection(f"queries/{query_id}/sources").document(f"source_{i}")
              batch.set(doc_ref, source)
         batch.commit()
    except Exception as e:
         print(f"Error saving sources: {e}")

def save_credibility_score(query_id: str, domain: str, score_data: Dict[str, Any]):
    if not FIREBASE_ENABLED: return
    try:
         doc_ref = db.collection(f"queries/{query_id}/credibility_scores").document(domain.replace("/", "_"))
         doc_ref.set(score_data)
    except Exception as e:
         print(f"Error saving cred score: {e}")
