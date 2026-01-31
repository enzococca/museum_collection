#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/enzo/Desktop/museum_collection/backend')

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Flask server on port 5001...")
    print("Visit http://localhost:5001/api/health to test")
    app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)
