import flask

DEBUG_MODE: bool = True

server = flask.Flask(__name__)

@server.route("/")
def main_page():
	return flask.render_template("TabletClock.html")

def run():
	server.run(debug=DEBUG_MODE)

if __name__ == "__main__":
	run()