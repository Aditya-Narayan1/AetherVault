db = db.getSiblingDB("aethervault");

db.createCollection("document_embeddings");
db.createCollection("search_history");

db.document_embeddings.createIndex({ documentId: 1 }, { unique: true });
db.search_history.createIndex({ createdAt: -1 });
