# Auto-LBO

Auto-LBO is a powerful web application designed to automatically generate full institutional Leveraged Buyout (LBO) models. By simply entering a publicly traded company's ticker symbol, financial professionals and students can instantly generate comprehensive LBO analysis and project returns. 

Built with Next.js, this tool streamlines the initial phases of private equity modeling.

## Features

- **Automated Modeling**: Generate comprehensive LBO models instantly by searching for a ticker symbol.
- **Data Visualization**: Interactive charts and institutional-grade data tables for project returns analysis.
- **Excel Export**: Download the generated model directly to an Excel `.xlsx` file for further customization and offline analysis.
- **Modern UI**: A sleek, dark-mode interface designed for high-end financial tools.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Visualization**: [Recharts](https://recharts.org/) & [TanStack Table](https://tanstack.com/table/v8)
- **Export**: [ExcelJS](https://github.com/exceljs/exceljs) & [FileSaver.js](https://github.com/eligrey/FileSaver.js)

## Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/heislk/Auto-LBO.git
cd Auto-LBO
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy the example environment file to create your local environment configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` to include your specific configuration and API keys:

- `CONTACT_EMAIL`: Your contact email
- `FRED_API_KEY`: (Optional) API key for Federal Reserve Economic Data (FRED)
- `QUOTE_PROVIDER`: (Optional) Your preferred market data provider
- `QUOTE_API_KEY`: (Optional) API key for your market data provider
- `REDIS_URL`: (Optional) Redis connection URL for caching data to improve performance

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or 
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Launch the application in your browser.
2. Enter a valid ticker symbol (e.g., `AAPL`) in the search bar.
3. View the generated LBO analysis, including project returns and interactive charts.
4. Export the data to Excel using the export functionality.

## License

Please refer to the `LICENSE` file in the root directory for licensing information.
