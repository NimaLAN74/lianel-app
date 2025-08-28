# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Copy pom first to leverage layer caching for deps
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:resolve dependency:resolve-plugins

# Now copy sources and build the jar
COPY src ./src
RUN mvn -q -e -DskipTests package spring-boot:repackage

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# If your pom sets <finalName>db-service</finalName> (as shared), the jar name is db-service.jar
COPY --from=builder /workspace/target/db-service.jar /app/db-service.jar

# Set the port db-service listens on
ENV SERVER_PORT=8081
EXPOSE 8081

# Optional JVM flags via JAVA_OPTS (e.g., -Xms256m -Xmx512m)
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/db-service.jar"]