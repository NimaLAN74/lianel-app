# ---------- Build stage: use Maven to compile the service ----------
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Copy POM first and warm the dependency cache
COPY pom.xml .
# Cache Maven repo between builds (BuildKit needed; Docker Desktop enables it by default)
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline

# Now copy sources and build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests package

# ---------- Runtime stage: slim JRE image ----------
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Copy the fat jar built by Spring Boot (name can vary; wildcard is safest)
COPY --from=builder /workspace/target/*-SNAPSHOT.jar /app/app.jar

# Reasonable defaults; tweak as you like
ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0"

EXPOSE 8083
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]