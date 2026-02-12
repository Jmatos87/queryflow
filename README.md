# QueryFlow

> Natural language query interface for datasets. Ask questions in plain English, get insights from your data.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-demo-link.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![QueryFlow Demo](./docs/demo.gif)

## 🚀 What is QueryFlow?

QueryFlow transforms how you interact with data. Upload CSV, JSON, or SQL dumps and query them conversationally - no SQL knowledge required.

**Instead of this:**
```sql
SELECT region, SUM(revenue) 
FROM sales 
WHERE quarter = 'Q4' AND revenue > 10000 
GROUP BY region 
ORDER BY SUM(revenue) DESC;
```

**Just ask this:**
> "Show me Q4 sales over $10k by region"

## ✨ Features

- 🗣️ **Natural Language Queries** - Ask questions like you're talking to a data analyst
- 📊 **Instant Visualizations** - Auto-generated charts and graphs
- 📁 **Multiple Formats** - Support for CSV, JSON, and SQL dumps
- 🧠 **Smart Schema Understanding** - Vector embeddings for intelligent data comprehension
- ⚡ **Real-time Results** - Fast query processing with optimized LLM calls
- 📥 **Export Results** - Download query results in multiple formats
- 🔒 **Privacy First** - Your data never leaves your session (optional cloud storage)

## 🎯 Use Cases

- **Business Analysts** - Explore sales data without writing SQL
- **Product Managers** - Quick insights from user analytics
- **Data Scientists** - Rapid exploratory data analysis
- **Finance Teams** - Ad-hoc reporting on financial data
- **Operations** - Query logistics and supply chain datasets

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Recharts** - Data visualization
- **React Query** - Server state management
- **Zustand** - Client state management

### Backend
- **Node.js** with Express
- **TypeScript**
- **MCP (Model Context Protocol)** - Standardized LLM communication
- **OpenAI API (GPT-4)** - Natural language to SQL translation
- **Supabase Client** - Database operations and file storage
- **PostgreSQL** - Query execution via Supabase

### Infrastructure
- **Vercel** - Frontend hosting (zero-config deployment)
- **Railway** - Backend/MCP server hosting
- **Supabase** - PostgreSQL database + file storage + auth

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Supabase account and project ([sign up here](https://supabase.com/))

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/queryflow.git
cd queryflow
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. **Set up environment variables**

**Backend (.env)**
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# MCP Server Configuration (optional for advanced features)
MCP_SERVER_URL=http://localhost:3002
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development servers**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 🎮 How to Use

1. **Upload Your Dataset**
   - Click "Upload File" and select CSV, JSON, or SQL dump
   - QueryFlow automatically analyzes your schema

2. **Ask Questions**
   - Type natural language queries in the chat interface
   - Examples:
     - "What are the top 5 products by revenue?"
     - "Show me customer growth month over month"
     - "Which regions had declining sales in Q4?"

3. **Explore Results**
   - View data in tables or charts
   - Export results as CSV, JSON, or SQL
   - Refine queries based on results

## 🏗️ Architecture

```
┌─────────────────┐
│   React Client  │
│   (Vite + TS)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express Server │
│   (Node + TS)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────────┐
│ MCP  │  │ Supabase  │
│Server│  │(Postgres) │
└───┬──┘  └───────────┘
    │
┌───▼────┐
│ OpenAI │
│  API   │
└────────┘
```

### MCP Architecture

QueryFlow uses **Model Context Protocol (MCP)** to create a standardized interface between the application and OpenAI. This architecture provides:

- **Tool Definitions** - Structured schema for data queries
- **Context Management** - Maintains conversation history and schema awareness
- **Error Handling** - Robust retry logic and fallback strategies
- **Extensibility** - Easy to swap LLM providers or add new tools

### Data Flow

1. User uploads dataset → Frontend sends to backend → Stored in Supabase Storage
2. Backend analyzes schema → Creates MCP tool definition → Stores metadata in Supabase
3. User asks question → MCP server formats request with schema context → Sends to OpenAI
4. OpenAI generates SQL → MCP validates query → Executes against Supabase Postgres
5. Results returned → Frontend renders table/chart → User can export or refine

## 🔐 Security & Privacy

- **No persistent storage** - Data is session-only by default
- **Secure API calls** - All LLM requests are authenticated
- **Input sanitization** - SQL injection protection
- **Rate limiting** - Prevents abuse
- **CORS configured** - Only allowed origins

## 🚧 Roadmap

### Phase 1: MVP ✅ (Current)
- [x] CSV upload and parsing
- [x] Basic natural language to SQL
- [x] Simple table visualization
- [x] Query history

### Phase 2: Enhanced Queries 🚧 (In Progress)
- [ ] JSON support
- [ ] SQL dump import
- [ ] Chart visualizations (bar, line, pie)
- [ ] Follow-up questions ("show me more details")
- [ ] Query suggestions based on schema
- [ ] MCP tool streaming for real-time query generation
- [ ] Multiple MCP server support for different data sources

### Phase 3: Advanced Features 🔮 (Planned)
- [ ] Multi-dataset joins
- [ ] Saved queries and dashboards
- [ ] Collaboration features (share queries)
- [ ] Excel/Google Sheets export
- [ ] API access for programmatic queries
- [ ] Custom SQL dialect support

### Phase 4: Enterprise Features 💼 (Future)
- [ ] User authentication
- [ ] Team workspaces
- [ ] Data source connectors (Postgres, MySQL, BigQuery)
- [ ] Scheduled queries and alerts
- [ ] Audit logs

## 🤝 Contributing

Contributions are welcome! Please check out the [Contributing Guide](CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Example Queries

```
"Show me the top 10 customers by total spend"
"What's the average order value by month?"
"Which products have declining sales?"
"Show me revenue breakdown by category"
"Find all transactions over $1000 in the last quarter"
"Compare sales between Q3 and Q4"
"What percentage of orders were returned?"
```

## 🐛 Known Issues

- Large datasets (>100MB) may have slow upload times
- Complex nested JSON requires flattening
- Some SQL dialects not fully supported yet

See [Issues](https://github.com/yourusername/queryflow/issues) for full list.

## 📚 Learn More

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Project Wiki](https://github.com/yourusername/queryflow/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Josh Matos**
- LinkedIn: [linkedin.com/in/joshmatos](https://linkedin.com/in/joshmatos)
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- Powered by [OpenAI](https://openai.com) GPT-4
- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Database and auth by [Supabase](https://supabase.com)
- Hosting by [Vercel](https://vercel.com) and [Railway](https://railway.app)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**⭐ If you find this project useful, please consider giving it a star!**

Built with ❤️ and ☕ by Josh Matos
