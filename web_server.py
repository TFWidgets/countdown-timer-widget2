#!/usr/bin/env python3
import http.server
import socketserver
import sys
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Устанавливаем текущую директорию как корень сервера
        super().__init__(*args, directory="/home/user/webapp", **kwargs)
    
    def log_message(self, format, *args):
        # Логируем запросы
        sys.stdout.write(f"{self.log_date_time_string()} - {format % args}\n")
        sys.stdout.flush()

if __name__ == "__main__":
    os.chdir("/home/user/webapp")
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}/")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()