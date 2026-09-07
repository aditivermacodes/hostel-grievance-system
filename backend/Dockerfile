# Stage 1: Build JAR using Maven wrapper
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Ensure line endings are LF for Linux execution
RUN apk add --no-cache dos2unix

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN dos2unix mvnw && chmod +x mvnw

# Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B || true

COPY src/ src/
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create persistent storage folder for grievance uploads
RUN mkdir -p /app/uploads

COPY --from=builder /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV FILE_STORAGE_PATH=/app/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
