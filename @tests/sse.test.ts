import { describe, it, expect } from "vitest";
import { TxOddsClient } from "../src/client";
import { SseMessage } from "../src/types";

describe("parseSseBlock", () => {
  it("parses a basic data message", () => {
    const block = "data: hello world";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe("hello world");
  });

  it("parses event + data", () => {
    const block = "event: update\ndata: {\"key\":\"value\"}";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.event).toBe("update");
    expect(result!.data).toBe('{"key":"value"}');
  });

  it("parses id, event, data, retry", () => {
    const block = "id: 123\nevent: score\ndata: test\nretry: 3000";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("123");
    expect(result!.event).toBe("score");
    expect(result!.data).toBe("test");
    expect(result!.retry).toBe(3000);
  });

  it("handles multiple data lines", () => {
    const block = "data: line1\ndata: line2\ndata: line3";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe("line1\nline2\nline3");
  });

  it("ignores comment lines starting with :", () => {
    const block = ": this is a comment\ndata: real data";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe("real data");
    expect(result!.event).toBeUndefined();
  });

  it("returns null for empty block", () => {
    expect(TxOddsClient.parseSseBlock("")).toBeNull();
  });

  it("returns null for block with only comments", () => {
    expect(TxOddsClient.parseSseBlock(": just a comment")).toBeNull();
  });

  it("handles Windows-style CRLF line endings", () => {
    const block = "data: hello\r\nevent: test\r\n";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe("hello");
    expect(result!.event).toBe("test");
  });

  it("handles field with no colon (treated as field name only)", () => {
    const block = "data";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe("");
  });

  it("trims single leading space after colon", () => {
    const block = "data: hello";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe("hello");
  });

  it("preserves data with leading whitespace beyond one space", () => {
    const block = "data:  two-spaces";
    const result = TxOddsClient.parseSseBlock(block);
    expect(result).not.toBeNull();
    expect(result!.data).toBe(" two-spaces");
  });
});

describe("parseSseData", () => {
  it("parses JSON string", () => {
    const result = TxOddsClient.parseSseData('{"fixtureId":123,"score":"2-1"}');
    expect(result).toEqual({ fixtureId: 123, score: "2-1" });
  });

  it("returns plain string for non-JSON", () => {
    const result = TxOddsClient.parseSseData("hello world");
    expect(result).toBe("hello world");
  });

  it("returns number for numeric JSON input", () => {
    const result = TxOddsClient.parseSseData("42");
    expect(result).toBe(42);
  });
});

describe("readSseMessages", () => {
  it("yields messages from a stream", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("data: first\n\n"));
        controller.enqueue(encoder.encode("data: second\n\nevent: done\ndata: third\n\n"));
        controller.close();
      },
    });

    const response = { body: stream, ok: true } as unknown as Response;
    const messages: SseMessage[] = [];
    for await (const msg of TxOddsClient.readSseMessages(response)) {
      messages.push(msg);
    }

    expect(messages).toHaveLength(3);
    expect(messages[0].data).toBe("first");
    expect(messages[1].data).toBe("second");
    expect(messages[2].data).toBe("third");
    expect(messages[2].event).toBe("done");
  });

  it("handles partial chunks that split across boundaries", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("data: he"));
        controller.enqueue(encoder.encode("llo\n\nda"));
        controller.enqueue(encoder.encode("ta: world\n\n"));
        controller.close();
      },
    });

    const response = { body: stream } as unknown as Response;
    const messages: SseMessage[] = [];
    for await (const msg of TxOddsClient.readSseMessages(response)) {
      messages.push(msg);
    }

    expect(messages).toHaveLength(2);
    expect(messages[0].data).toBe("hello");
    expect(messages[1].data).toBe("world");
  });

  it("throws if response has no body", async () => {
    const response = {} as Response;
    await expect(async () => {
      for await (const _ of TxOddsClient.readSseMessages(response)) {
        // should not reach
      }
    }).rejects.toThrow("Stream response has no body");
  });
});
