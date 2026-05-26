@echo off
echo ========================================================
echo   Aerocode V3 - Reset de Banco de Dados
echo ========================================================
echo.
echo Atenção: Todos os dados cadastrados serão APAGADOS e 
echo os dados de exemplo (Seed) serão recriados.
echo.
pause

echo.
echo Limpando banco de dados e recriando estruturas...
docker exec aerocode-api sh -c "npx prisma db push --force-reset --accept-data-loss"

echo.
echo Recriando dados de exemplo (Seed)...
docker exec aerocode-api sh -c "npx prisma db seed"

echo.
echo ========================================================
echo   Banco de dados limpo com sucesso!
echo ========================================================
pause
