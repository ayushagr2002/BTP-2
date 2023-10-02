from flask import Flask, Blueprint, jsonify, request
from flask_cors import CORS
import os   
import joblib
import sys
import pandas as pd
import time
# sys.path.append(os.getenv('PROJECT_PATH'))
# sys.path.append('../')
# from mongo import db
# collection = db['Model_zoo']
app = Flask(__name__)
CORS(app)
model_id = None
model = None


# def loadModel(model_id):
#     trained_model = collection.find_one({'model_id': model_id})
#     model_path = trained_model['saved_model_path']
#     model = joblib.load(model_path)
#     return model

# @app.route('/<model_id>/predict', methods=['POST'])
# def predict(model_id):
#     global model
#     if model_id == model_id:
#         data = request.get_json()
#         data = data['data']
#         data = pd.DataFrame(data)
#         predictions = model.predict(data)
#         return {'predictions': predictions}
#     else:
#         return {'status': 'error', 'message': 'Model not deployed'}

if __name__ == '__main__':
    # model_id = sys.argv[1]
    # model = loadModel(model_id)
    print("Hello")
    app.run(port=5001)
    time.sleep(5)