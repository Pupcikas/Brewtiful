FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /App

COPY . .

RUN dotnet restore

RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /App
COPY --from=build /App/out .

VOLUME /App/DataProtection-Keys

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Brewtiful.dll"]
