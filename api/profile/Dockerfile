# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:resolve dependency:resolve-plugins
COPY src ./src
RUN mvn -q -e -DskipTests package spring-boot:repackage

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/target/profile-service.jar /app/profile-service.jar
ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/profile-service.jar"]