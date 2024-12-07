FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build-env
WORKDIR /App

COPY 5semestras/Brewtiful/backend .

RUN dotnet restore

RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /App
COPY --from=build-env /App/out .

ENTRYPOINT ["dotnet", "backend.dll"]
