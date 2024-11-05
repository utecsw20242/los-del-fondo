from flask import Flask, jsonify
from models import HelloWorld

app = Flask(__name__)

@app.route('/hello', methods=['GET'])
def hello():
    return jsonify(HelloWorld.greet())

if __name__ == '__main__':
    app.run(debug=True)