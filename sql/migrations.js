export const versions = {
    "1": [
        "create table db_version (name TEXT PRIMARY KEY, value TEXT NOT NULL);",
        "insert into db_version (name, value) values ('version', 1)",
        "insert into db_version (name, value) values ('last_sync', 0)",
        "create table songs (id INTEGER PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL,number INTEGER NOT NULL, updated INTEGER NOT NULL);"
    ]
};
