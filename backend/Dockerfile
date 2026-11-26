FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY KaizenBoard.Api/KaizenBoard.Api.csproj KaizenBoard.Api/
RUN dotnet restore KaizenBoard.Api/KaizenBoard.Api.csproj
COPY KaizenBoard.Api/ KaizenBoard.Api/
RUN dotnet publish KaizenBoard.Api/KaizenBoard.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "KaizenBoard.Api.dll"]
