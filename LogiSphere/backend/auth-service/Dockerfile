# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Cache dependencies separately from source code
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Run as an unprivileged user
RUN groupadd --system spring \
    && useradd --system --gid spring --create-home spring

COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

USER spring:spring

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -Xms128m -Xmx280m -XX:MaxMetaspaceSize=128m -Xss256k -XX:+ExitOnOutOfMemoryError"

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
