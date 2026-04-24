// Arduino UNO + DHT11 + MQ2
// Sends readings over Serial as CSV:
// temperature,humidity,gasAnalog,gasDigital

#include <DHT11.h>

#define DHTPIN 8
#define MQ2_A0 A0
#define MQ2_D0 5

DHT11 dht11(DHTPIN);

void setup() {
  Serial.begin(9600);
  pinMode(MQ2_D0, INPUT);
}

void loop() {
  int temperature = 0;
  int humidity = 0;

  int result = dht11.readTemperatureHumidity(temperature, humidity);
  int gasAnalog = analogRead(MQ2_A0);
  int gasDigital = digitalRead(MQ2_D0);

  if (result == 0) {
    Serial.print(temperature);
    Serial.print(",");
    Serial.print(humidity);
    Serial.print(",");
    Serial.print(gasAnalog);
    Serial.print(",");
    Serial.println(gasDigital);
  }

  delay(2000);
}
