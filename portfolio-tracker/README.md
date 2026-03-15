# Portfolio Tracker

App de seguimiento de portafolio de inversiones (crypto + acciones).

## Funcionalidades

- **Dashboard**: valor total, PnL, distribución en pie chart, evolución histórica
- **Portafolio**: detalle por activo con precio promedio de compra, ganancia acumulada
- **Transacciones**: agregar compras/ventas, filtrar, eliminar
- **Importar CSV**: carga masiva de transacciones
- **Precios en tiempo real**: CoinGecko (crypto) + Yahoo Finance (acciones)
- **Auth**: registro/login con JWT

## Setup rápido (Docker)

```bash
cd portfolio-tracker
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Setup manual

### Backend
```bash
cd backend
cp .env.example .env
# Edita .env con tu DATABASE_URL y JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Base de datos
Requiere PostgreSQL. Las tablas se crean automáticamente al iniciar el backend.

## Formato CSV para importar

```csv
symbol,name,asset_type,type,quantity,price_per_unit,fee,date,notes
BTC,Bitcoin,crypto,buy,0.5,45000,10,2024-01-15,Compra en Binance
AAPL,Apple Inc.,stock,buy,10,180.5,1,2024-01-20,
```

Descarga la plantilla desde la app en **Transacciones → Importar CSV → Descargar plantilla**.
