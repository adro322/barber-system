# Upgrade Plan: barber-system (20260606001958)

- **Generated**: 2026-06-05 12:04:00
- **HEAD Branch**: main
- **HEAD Commit ID**: unknown

## Available Tools

**JDKs**
- JDK 21.0.5: C:\Program Files\Java\jdk-21\bin (required by steps 1-4)

**Build Tools**
- Maven 3.9.11: C:\apache-maven-3.9.11\bin
- Maven Wrapper: 3.9.16 (backend/mvnw) — compatible with Java 21

## Guidelines

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred.

## Options

- Working branch: appmod/java-upgrade-20260606001958
- Run tests before and after the upgrade: true

## Upgrade Goals

- Upgrade Java runtime to the latest LTS version (Java 21)

## Technology Stack

| Technology/Dependency | Current | Min Compatible | Why Incompatible |
| --------------------- | ------- | -------------- | ---------------- |
| Java | 21 | 21 | User requested target / already current |
| Spring Boot | 4.0.6 | 4.0.6 | already current and compatible with Java 21 |
| Maven Wrapper | 3.9.16 | 3.9.16 | compatible with Java 21 |
| Maven | 3.9.11 | 3.9.11 | compatible with Java 21 |
| Lombok | managed by Spring Boot BOM | 1.18.20+ | required for current source generation; appears configured |

## Derived Upgrades

- No Spring Boot or Java version change is required because the project already targets Java 21.
- The upgrade focus is on verifying the runtime environment and resolving existing compile-time issues that prevent the project from building under the requested target.

## Impact Analysis

### Dependency Changes

| File | Dependency | Current | Action | Target | Reason |
|------|------------|---------|--------|--------|--------|
| backend/pom.xml | java.version property | 21 | none | 21 | Already targets latest LTS |
| backend/pom.xml | Maven wrapper | 3.9.16 | none | 3.9.16 | Compatible with Java 21 |

### Source Code Changes

| File | Location | Current | Required Change | Reason |
|------|----------|---------|----------------|--------|
| backend/src/main/java/repository/ | source tree | duplicate repository source files | remove directory backend/src/main/java/repository | eliminates duplicate `integrador.backend.repository` class definitions and allows compile to proceed |
| backend/src/main/java/integrador/backend/entity/Barbero.java | `estado` field | `private String estado = "ACTIVO";` | change to `@Enumerated(EnumType.STRING) private EstadoBarbero estado = EstadoBarbero.ACTIVO;` | aligns entity type with repository/service expectations and removes string/enum mismatch |
| backend/src/main/java/integrador/backend/entity/Turno.java | `estado` field | `private String estado = "ESPERA";` | change to `@Enumerated(EnumType.STRING) private EstadoTurno estado = EstadoTurno.ESPERA;` | aligns entity type with repository/service expectations |
| backend/src/main/java/integrador/backend/service/BarberoService.java | builder usage | `Usuario.builder()` / `Barbero.builder()` / enum comparison | replace with explicit object construction/setters; compare enum values directly | fixes invalid compile-time builder references and status update logic |
| backend/src/main/java/integrador/backend/service/CajaService.java | builder usage | `Transaccion.builder()` / `Reporte.builder()` | replace with explicit object construction/setters | fixes invalid compile-time builder references |
| backend/src/main/java/integrador/backend/service/ColaService.java | builder usage | `Turno.builder()` | replace with explicit object construction/setters | fixes invalid compile-time builder references |
| backend/src/main/java/integrador/backend/service/InventarioService.java | builder usage | `Insumo.builder()` | replace with explicit object construction/setters | fixes invalid compile-time builder references |

### Configuration Changes

| File | Property/Setting | Current | Required Change | Reason |
|------|------------------|---------|----------------|--------|
| backend/pom.xml | `java.version` | 21 | none | already aligned to latest LTS |

### CI/CD Changes

| File | Location | Current | Required Change |
|------|----------|---------|----------------|
| N/A | N/A | N/A | N/A |

### Risks & Warnings

- **Local Maven wrapper default runtime mismatch**: `backend/mvnw.cmd -version` currently reports Java 17, while the project is configured for Java 21. Mitigation: force verification commands to use JDK 21 via `JAVA_HOME` in the upgrade steps.
- **Pre-existing compile failures**: duplicate repository source files and invalid builder usage in service classes currently prevent baseline compilation. Mitigation: resolve these code issues as part of the upgrade before final validation.
- **Git metadata**: HEAD commit ID is not available from the version control API response. Use branch `main` and branch `appmod/java-upgrade-20260606001958` for tracking.

## Upgrade Steps

- Step 1: Verify Java 21 and Maven toolchain
  - **Rationale**: Confirm the requested target JDK is available and that the Maven wrapper will be executed with Java 21 instead of the current Java 17 runtime.
  - **Changes to Make**: No source changes. Validate tools and runtime paths from `appmod-list-jdks`, `appmod-list-mavens`, and `backend/mvnw.cmd -version` under JDK 21.
  - **Verification**: `cd backend && $env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -version`

- Step 2: Establish baseline compilation status under Java 21
  - **Rationale**: Capture current build health before making any source modifications and verify that Java 21 is required for compilation.
  - **Changes to Make**: None yet. Run baseline compile using JDK 21.
  - **Verification**: `cd backend && $env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -q -DskipTests clean test-compile`

- Step 3: Fix compile blockers and align entity state modeling
  - **Rationale**: Resolve duplicate class definitions and source-level builder/state mismatches that currently prevent the project from compiling under the target runtime.
  - **Changes to Make**: Remove stale duplicate repository source tree; convert `Barbero.estado` and `Turno.estado` to enum-backed fields; replace invalid `.builder()` usage in service classes with explicit object construction and setters.
  - **Verification**: `cd backend && $env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -q -DskipTests clean test-compile`

- Step 4: Final validation with full test suite
  - **Rationale**: Confirm the runtime upgrade target and source fixes together deliver a clean build and passing tests under Java 21.
  - **Changes to Make**: None beyond previous step unless test failures surface.
  - **Verification**: `cd backend && $env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -q clean test`
