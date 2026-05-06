Simple static client to test backend connectivity.

How to run:

1. From repository root or workspace open a terminal and run:

```bash
cd frontend/simple_client
python -m http.server 3000
```

2. Open http://localhost:3000 in your browser and click "Check /health".

Notes:
- The test client calls http://localhost:8000/health by default. If your backend runs on a different host/port, edit `index.html` and replace the URL.
- Alternatively you can use `npx serve . -l 3000` if you prefer.
