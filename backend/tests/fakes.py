"""Small fakes for Supabase-style fluent query chains."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class QueryResult:
    data: Any = None


class FakeDB:
    def __init__(self, tables: dict[str, list[dict]] | None = None) -> None:
        self.tables = tables or {}
        self.updates: list[dict] = []
        self.rpcs: list[dict] = []
        self.events: list[dict] = []

    def table(self, name: str) -> "FakeTableQuery":
        return FakeTableQuery(self, name)

    def rpc(self, name: str, params: dict) -> "FakeRpcQuery":
        self.rpcs.append({"name": name, "params": params})
        return FakeRpcQuery()


class FakeRpcQuery:
    def __init__(self, data: Any = None) -> None:
        self.data = data if data is not None else []

    def execute(self) -> QueryResult:
        return QueryResult(self.data)


class FakeTableQuery:
    def __init__(self, db: FakeDB, table_name: str) -> None:
        self.db = db
        self.table_name = table_name
        self.action: str | None = None
        self.payload: dict | None = None
        self.filters: list[tuple[str, Any]] = []
        self.limit_count: int | None = None

    def select(self, *_args: str) -> "FakeTableQuery":
        self.action = "select"
        return self

    def update(self, payload: dict) -> "FakeTableQuery":
        self.action = "update"
        self.payload = payload
        return self

    def eq(self, field: str, value: Any) -> "FakeTableQuery":
        self.filters.append((field, value))
        return self

    def limit(self, count: int) -> "FakeTableQuery":
        self.limit_count = count
        return self

    def order(self, *_args: str, **_kwargs: Any) -> "FakeTableQuery":
        return self

    def execute(self) -> QueryResult:
        if self.action == "update":
            operation = {
                "table": self.table_name,
                "payload": self.payload or {},
                "filters": list(self.filters),
            }
            self.db.updates.append(operation)
            self.db.events.append({"type": "update", **operation})
            for row in self._matching_rows():
                row.update(self.payload or {})
            return QueryResult([])

        rows = list(self._matching_rows())
        if self.limit_count is not None:
            rows = rows[: self.limit_count]
        return QueryResult(rows)

    def _matching_rows(self) -> list[dict]:
        rows = self.db.tables.get(self.table_name, [])
        for field, value in self.filters:
            rows = [row for row in rows if row.get(field) == value]
        return rows
