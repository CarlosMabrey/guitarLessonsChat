Here is a prompt outlining how you could implement the benefits of Agentic RAG and Knowledge Graphs into an organization's web application, drawing directly from the provided sources:

---

**Project Brief: Developing an Intelligent Knowledge Retrieval Web Application with Agentic RAG and Knowledge Graphs**

**Objective:** To build a cutting-edge web application that provides users within [Organization Name] with highly flexible, accurate, and context-aware information retrieval from our comprehensive internal knowledge base. The application should leverage a hybrid retrieval augmented generation (RAG) system, combining vector databases and knowledge graphs, driven by an intelligent AI agent.

**Key Capabilities and Implementation Details for the Web App:**

1.  **Intelligent Query Handling & Agentic RAG Foundation:**
    *   The core of this web application will be an **Agentic RAG system**, which empowers our AI agent to "reason about how it explores the knowledge base". Unlike traditional RAG that force-feeds context, our agent will dynamically decide the optimal strategy for information retrieval.
    *   Users should be able to ask complex, natural language questions through a web interface (e.g., a smart search bar or chat interface).

2.  **Hybrid Knowledge Retrieval System:**
    *   **Vector Database for Individual Lookups:**
        *   Implement a **Postgres database utilizing the `pg_vector` extension** (e.g., hosted on Neon platform). This will store document chunks and their vector embeddings.
        *   It will be primarily used for "individual information lookups" on specific entities, such as "what are the AI initiatives for Google".
        *   **Crucially, ensure that if a different embedding model is used (e.g., other than OpenAI's `text-embed-3-small`), the `vector dimensions` (e.g., `1536`) are updated accordingly in the SQL setup script**.
    *   **Knowledge Graph for Relational Queries:**
        *   Integrate a **Neo4j database as the underlying knowledge graph engine**, utilizing the **Graffiti library** for knowledge graph creation and management.
        *   This component is vital for answering questions that involve "relationships between entities," such as "how are OpenAI and Microsoft related".
        *   The knowledge graph will represent information relationally, giving the agent a distinct way to explore the knowledge.
    *   **Combined Search for Complex Queries:** The system must support queries that benefit from both individual facts and relational context, allowing the agent to "use both search types" for questions like "what are the initiatives for Microsoft how does that relate to anthropic".

3.  **Dynamic Agent Tool Selection & Configuration:**
    *   The AI agent, built using a framework like **Pydantic AI**, must have the capability to **"pick and choose how it explores the knowledge"**.
    *   This dynamic behavior will be primarily defined and controlled within the **system prompt for the agent (e.g., in `prompts.py`)**. This prompt will contain "instructions that tell the agent when and how to use each of the different capabilities".
    *   The prompt should guide the agent to:
        *   "Use the knowledge graph tool only when the user asks about two companies in the same question" for analyzing relationships.
        *   "Just use the vector store tool" otherwise.
        *   Be able to "combine both approaches" when appropriate.
    *   **It is essential to "tweak this system prompt to your needs based on the way that you want the agent to reason about how it explores your knowledge base," as a generic prompt may not perfectly suit specific organizational data**.

4.  **Backend Architecture & Data Ingestion Pipeline:**
    *   The agent's capabilities will be exposed via a **FastAPI endpoint**, allowing the web frontend to communicate with the intelligent agent.
    *   Develop a robust **data ingestion script** (similar to `ingestion.py`) that will automatically process internal documents (e.g., Markdown files placed in a designated `documents` folder).
    *   This script must perform:
        *   **Document Chunking and Embedding:** Splitting documents into "bite-sized chunks" and generating vector representations stored in the Postgres vector database.
        *   **Knowledge Graph Extraction:** Using an LLM (potentially a more lightweight model like `gpt-4.1-nano`) to define "entities and relationships" from the documents for insertion into the Neo4j knowledge graph.
        *   **Note:** Knowledge graph ingestion is "very computationally expensive" and requires patience, taking "a couple of minutes to process" a single document compared to a few seconds for vector database insertion. However, "the actual querying of the knowledge graph is very fast".
    *   Ensure configuration for **LLM and embedding providers** is flexible (e.g., supporting OpenAI, Ollama, Gemini, OpenRouter, and allowing different providers for LLM and embeddings).

5.  **Development Process (Leveraging AI Coding Assistants - e.g., Claude Code):**
    *   **Adopt a "Plan Mode" First Approach:** Begin the development process by entering a planning mode (e.g., hitting `Shift+Tab` twice in Claude Code). This forces the AI assistant to focus on creating a comprehensive plan before writing any code to the file system.
    *   **Structured Planning Documents:**
        *   Utilize **`claw.md`** for global rules and general instructions for the AI coding assistant.
        *   Create **`planning.md`** to describe the project at a high level, including the architecture, core components, folder paths, technology stack, and design principles.
        *   Develop a **`task.md`** file, which will contain a granular, ordered list of tasks for the AI coding assistant to complete one by one.
    *   **Generate Ideas and Refine with Follow-up Questions:** In plan mode, "start spewing out a bunch of ideas for what you want to create and then ask it to ask you follow-up questions" to ensure the AI assistant deeply understands the vision and architecture.
    *   **Provide Examples for Inspiration:** Maintain an **`examples` folder** containing relevant Python scripts from previous projects (e.g., how Graffiti was set up, or how Pydantic AI agents were built). Instruct the AI assistant to reference these for "inspiration for best practices and implementation patterns".
    *   **Human Validation and Refinement:** While the AI coding assistant can perform extensive work (running for "30 minutes to an hour just building everything"), **it is crucial to "have the knowledge to validate the output" and to "add that last 10%" yourself** to ensure perfect functionality.

**Technology Stack (Recommended):**
*   **Python**
*   **Pydantic AI** (for AI agent framework)
*   **Graffiti** (for knowledge graph library)
*   **Neo4j** (underlying knowledge graph engine)
*   **Postgres with `pg_vector`** (vector database)
*   **FastAPI** (for building the agent API)
*   Your chosen **LLM Provider** (e.g., OpenAI, Ollama, OpenRouter, Gemini)
*   Your chosen **Embedding Provider** (e.g., OpenAI, Gemini, separate from LLM provider if needed)
*   An **AI Coding Assistant** (e.g., Claude Code)

---