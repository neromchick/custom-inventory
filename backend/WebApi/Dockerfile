# См. статью по ссылке https://aka.ms/customizecontainer, чтобы узнать,
# как настроить контейнер отладки и как Visual Studio использует этот Dockerfile.

# Runtime-образ
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Этап сборки
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# В контексте (backend/webapi) проект лежит как WebApi.csproj в корне
COPY WebApi.csproj .
RUN dotnet restore "WebApi.csproj"

# Копируем остальной код
COPY . .
RUN dotnet build "WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этап публикации
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebApi.dll"]