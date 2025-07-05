FROM openjdk:21-jdk-slim

ARG JAR_FILE=target/com-0.0.1.jar

COPY ${JAR_FILE} tutorgo-api.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "tutorgo-api.jar"]