package com.athkar.alyawm;

import android.content.res.AssetManager;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class AssetServer extends Thread {
  private final AssetManager assets;
  private ServerSocket socket;
  private volatile boolean running = true;
  private final CountDownLatch ready = new CountDownLatch(1);

  public AssetServer(AssetManager assets) {
    this.assets = assets;
    setDaemon(true);
    setName("athkar-http");
  }

  public void startAndWait() {
    start();
    try {
      ready.await(2, TimeUnit.SECONDS);
    } catch (InterruptedException ignored) {
    }
  }

  public void stopServer() {
    running = false;
    try {
      if (socket != null) socket.close();
    } catch (IOException ignored) {
    }
  }

  @Override
  public void run() {
    try {
      socket = new ServerSocket(18765, 50, InetAddress.getByName("127.0.0.1"));
      ready.countDown();
      while (running) {
        try {
          Socket client = socket.accept();
          new Thread(() -> handle(client), "athkar-req").start();
        } catch (IOException e) {
          if (running) break;
        }
      }
    } catch (IOException e) {
      ready.countDown();
    }
  }

  private void handle(Socket client) {
    try {
      InputStream in = client.getInputStream();
      OutputStream out = client.getOutputStream();
      byte[] buf = new byte[8192];
      int n = in.read(buf);
      if (n <= 0) {
        client.close();
        return;
      }
      String head = new String(buf, 0, n, "UTF-8");
      String line = head.split("\r\n")[0];
      String[] parts = line.split(" ");
      String path = parts.length > 1 ? parts[1] : "/";
      int q = path.indexOf('?');
      if (q >= 0) path = path.substring(0, q);
      if (path.equals("/")) path = "/index.html";
      serve(out, path);
    } catch (IOException ignored) {
    } finally {
      try {
        client.close();
      } catch (IOException ignored) {
      }
    }
  }

  private void serve(OutputStream out, String path) throws IOException {
    String rel = path.startsWith("/") ? path.substring(1) : path;
    byte[] body = readAsset("www/" + rel);
    if (body == null) body = readAsset("www/index.html");
    if (body == null) {
      byte[] msg = "not found".getBytes("UTF-8");
      out.write(("HTTP/1.1 404 Not Found\r\nContent-Length: " + msg.length + "\r\nConnection: close\r\n\r\n").getBytes("UTF-8"));
      out.write(msg);
      return;
    }
    String mime = mime(rel);
    String headers =
        "HTTP/1.1 200 OK\r\n"
            + "Content-Type: "
            + mime
            + "\r\n"
            + "Content-Length: "
            + body.length
            + "\r\n"
            + "Cache-Control: public, max-age=86400\r\n"
            + "Connection: close\r\n\r\n";
    out.write(headers.getBytes("UTF-8"));
    out.write(body);
    out.flush();
  }

  private byte[] readAsset(String name) {
    try (InputStream in = assets.open(name);
        ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
      byte[] buf = new byte[16384];
      int n;
      while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
      return bos.toByteArray();
    } catch (IOException e) {
      return null;
    }
  }

  private static String mime(String path) {
    String p = path.toLowerCase();
    if (p.endsWith(".html")) return "text/html; charset=utf-8";
    if (p.endsWith(".js")) return "application/javascript; charset=utf-8";
    if (p.endsWith(".css")) return "text/css; charset=utf-8";
    if (p.endsWith(".json")) return "application/json; charset=utf-8";
    if (p.endsWith(".svg")) return "image/svg+xml";
    if (p.endsWith(".png")) return "image/png";
    if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
    if (p.endsWith(".webp")) return "image/webp";
    if (p.endsWith(".woff2")) return "font/woff2";
    if (p.endsWith(".xml")) return "application/xml";
    if (p.endsWith(".webmanifest")) return "application/manifest+json";
    return "application/octet-stream";
  }
}
