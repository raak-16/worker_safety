// Worker Safety Monitor - ESP32/Arduino Code
// Supports DHT11 (Temperature/Humidity) and MQ2 (Gas) sensors
// Sends data to Next.js API endpoint

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

#define MQ2_A0 34  // Analog pin
#define MQ2_D0 35  // Digital pin

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoint (change to your deployed URL)
const char* serverUrl = "http://YOUR_LOCAL_IP:3000/api/sensors";

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastUpdate = 0;
const unsigned long updateInterval = 5000; // 5 seconds

float temperature = 0;
float humidity = 0;
int gasAnalog = 0;
bool gasDigital = false;

void setup() {
  Serial.begin(115200);
  
  pinMode(MQ2_D0, INPUT);
  
  dht.begin();
  
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  if (millis() - lastUpdate >= updateInterval) {
    readSensors();
    sendDataToServer();
    lastUpdate = millis();
  }
  
  delay(100);
}

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Connection Failed!");
  }
}

void readSensors() {
  // Read DHT11
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;
  
  // Read MQ2
  gasAnalog = analogRead(MQ2_A0);
  gasDigital = digitalRead(MQ2_D0) == HIGH;
  
  Serial.println("=== Sensor Readings ===");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" C");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  Serial.print("Gas Analog: ");
  Serial.println(gasAnalog);
  Serial.print("Gas Digital: ");
  Serial.println(gasDigital ? "HIGH (LEAK!)" : "LOW");
  Serial.println("========================");
}

void sendDataToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String jsonPayload = "{";
    jsonPayload += "\"temperature\":" + String(temperature) + ",";
    jsonPayload += "\"humidity\":" + String(humidity) + ",";
    jsonPayload += "\"gasAnalog\":" + String(gasAnalog) + ",";
    jsonPayload += "\"gasDigital\":" + String(gasDigital ? "true" : "false");
    jsonPayload += "}";
    
    Serial.println("Sending data to server...");
    Serial.println(jsonPayload);
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on sending POST: " + String(http.errorToString(httpResponseCode)));
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}