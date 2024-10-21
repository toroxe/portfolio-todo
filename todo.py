from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Tillåt CORS för alla domäner

# Sätt en absolut sökväg för todos.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TODOS_FILE_PATH = os.path.join(BASE_DIR, 'frontend/todos.json')

# Ladda todos från JSON-filen
def load_todos():
    try:
        with open(TODOS_FILE_PATH, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# Spara todos till JSON-filen
def save_todos():
    try:
        with open(TODOS_FILE_PATH, 'w') as file:
            json.dump(todos, file, indent=4)
        app.logger.info(f"Todos har sparats till {TODOS_FILE_PATH}")
    except Exception as e:
        app.logger.error(f"Fel vid sparning till todos.json: {e}")



# Ladda todos vid uppstart
todos = load_todos()

# Endpoint för att hämta alla todos
@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(todos)

@app.route('/')
def index():
    return "Todo API is up and running"


# Endpoint för att lägga till en ny todo
@app.route('/todos', methods=['POST'])
def add_todo():
    new_todo = request.get_json()
    todos.append(new_todo)
    try:
        save_todos()  # Försök att spara den nya listan till JSON-filen
    except Exception as e:
        return jsonify({'error': 'Kunde inte spara till filen', 'details': str(e)}), 500
    return jsonify(new_todo), 201

# Endpoint för att uppdatera status för en todo
@app.route('/todos/<int:todo_id>', methods=['PATCH'])
def update_todo(todo_id):
    for todo in todos:
        if todo['id'] == todo_id:
            todo['completed'] = request.json.get('completed', todo['completed'])
            try:
                save_todos()  # Spara efter uppdatering
            except Exception as e:
                return jsonify({'error': 'Kunde inte spara till filen', 'details': str(e)}), 500
            return jsonify(todo)
    return jsonify({'error': 'Todo not found'}), 404

# Endpoint för att radera en todo
@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    global todos
    todos = [todo for todo in todos if todo['id'] != todo_id]
    try:
        save_todos()  # Spara efter radering
    except Exception as e:
        return jsonify({'error': 'Kunde inte spara till filen', 'details': str(e)}), 500
    return jsonify({'message': 'Todo deleted'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)