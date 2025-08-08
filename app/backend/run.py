import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' ## deploy ederken değiştir !!

from llm_proxy.__init__ import create_app

app = create_app()

# flask run --host=localhost --port=5000 run with this on backend dir

if __name__ == '__main__':
    app.run(debug = True)