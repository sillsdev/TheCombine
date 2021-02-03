import argparse
import http.server
import ssl


def parse_args() -> argparse.Namespace:
    ...


def main() -> None:
    args = parse_args()

    server_address = ("", 443)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        server_side=True,
        certfile=args.cert_file,
        keyfile=args.key_file,
        ssl_version=ssl.PROTOCOL_TLS,
    )
    httpd.serve_forever()


if __name__ == "__main__":
    main()
