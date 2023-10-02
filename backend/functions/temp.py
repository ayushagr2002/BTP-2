import subprocess

def run():
    model_id = 'vdfv'
    process = subprocess.Popen(['gnome-terminal', '--', '/bin/python3', '/home/ayush/BTP-2/backend/functions/hostModel.py'])
    return {'status': 'success', 'message': 'Model deployed successfully', 'endpoint' : 'http://localhost:5000/{model_id}/predict'.format(model_id=model_id)}

if __name__ == '__main__':
    run()