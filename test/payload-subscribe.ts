import jsonFixtures from "./fixtures/xumm-api.json";
import * as jestFixtures from "./fixtures/xumm-api";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

import { XummSdk, XummTypes } from "../src/";
import { Server, WebSocket as MockedWebSocket } from "mock-socket";

const wsEol = [MockedWebSocket.CLOSED, MockedWebSocket.CLOSING];

let mockServer: Server;

beforeAll(() => {
  Object.assign(global, { MockedWebSocket });

  mockServer = new Server("ws://xumm.local");

  mockServer.on("connection", (socket) => {
    socket.send(JSON.stringify(jestFixtures.subscriptionUpdates.welcome));

    setTimeout(() => {
      socket.send(JSON.stringify(jestFixtures.subscriptionUpdates.expire));
    }, 150);

    setTimeout(() => {
      socket.send(JSON.stringify(jestFixtures.subscriptionUpdates.opened));
    }, 250);

    setTimeout(() => {
      socket.send(JSON.stringify(jestFixtures.subscriptionUpdates.rejected));
    }, 350);
  });
});

afterAll(() => {
  mockServer.close();
});

describe("XUMM Payload Subscriptions", () => {
  process.env.XUMM_APIKEY = jsonFixtures.api.key;
  process.env.XUMM_APISECRET = jsonFixtures.api.secret;

  const Sdk = new XummSdk();

  it("should subscribe & resolve using inner resolve method @ callback", async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get));

    const subscriptionSocket = await Sdk.payload.subscribe(
      "0ef943e9-18ae-4fa2-952a-6f55dce363f0",
      (event) => {
        if (typeof event.data.signed !== "undefined") {
          return event.resolve(event.data);
        }
      }
    );

    expect(subscriptionSocket).toMatchObject({
      payload: jsonFixtures.payload.get,
      resolve: expect.any(Function),
      resolved: expect.any(Promise),
      websocket: expect.any(MockedWebSocket),
    });

    await new Promise(
      (resolve) => (subscriptionSocket.websocket.onopen = resolve)
    );

    expect(subscriptionSocket.websocket.readyState).toEqual(
      subscriptionSocket.websocket.OPEN
    );
    expect(await subscriptionSocket.resolved).toMatchObject(
      jestFixtures.subscriptionUpdates.rejected
    );
    expect(wsEol).toEqual(
      expect.arrayContaining([subscriptionSocket.websocket.readyState])
    );

    return;
  });

  it("should subscribe & resolve using return @ callback", async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get));

    const subscriptionSocket = await Sdk.payload.subscribe(
      "0ef943e9-18ae-4fa2-952a-6f55dce363f0",
      (event) => {
        if (typeof event.data.signed !== "undefined") {
          return event.data;
        }
      }
    );

    expect(subscriptionSocket).toMatchObject({
      payload: jsonFixtures.payload.get,
      resolve: expect.any(Function),
      resolved: expect.any(Promise),
      websocket: expect.any(MockedWebSocket),
    });

    await new Promise(
      (resolve) => (subscriptionSocket.websocket.onopen = resolve)
    );

    expect(subscriptionSocket.websocket.readyState).toEqual(
      subscriptionSocket.websocket.OPEN
    );
    expect(await subscriptionSocket.resolved).toMatchObject(
      jestFixtures.subscriptionUpdates.rejected
    );
    expect(wsEol).toEqual(
      expect.arrayContaining([subscriptionSocket.websocket.readyState])
    );

    return;
  });

  it("should subscribe & resolve using obj.resolve() method", async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get));

    const subscriptionSocket = await Sdk.payload.subscribe(
      "0ef943e9-18ae-4fa2-952a-6f55dce363f0"
    );

    expect(subscriptionSocket).toMatchObject({
      payload: jsonFixtures.payload.get,
      resolve: expect.any(Function),
      resolved: expect.any(Promise),
      websocket: expect.any(MockedWebSocket),
    });

    await new Promise(
      (resolve) => (subscriptionSocket.websocket.onopen = resolve)
    );

    expect(subscriptionSocket.websocket.readyState).toEqual(
      subscriptionSocket.websocket.OPEN
    );

    let receivedWsMessages = 0;
    subscriptionSocket.websocket.onmessage = () => receivedWsMessages++;

    setTimeout(() => {
      subscriptionSocket.resolve({ dummyObject: true });
      expect(receivedWsMessages).toEqual(3);
    }, 500);

    expect(await subscriptionSocket.resolved).toMatchObject({
      dummyObject: true,
    });
    expect(wsEol).toEqual(
      expect.arrayContaining([subscriptionSocket.websocket.readyState])
    );

    return;
  });

  it("should create, subscribe & resolve using return @ callback", async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.created));
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get));

    const payload =
      jestFixtures.validPayload as XummTypes.XummPostPayloadBodyJson;
    const createdAndSubscribed = await Sdk.payload.createAndSubscribe(
      payload,
      (event) => {
        if (typeof event.data.signed !== "undefined") {
          return event.data;
        }
      }
    );

    expect(createdAndSubscribed).toMatchObject({
      created: jestFixtures.createPayloadResponseObject,
      payload: jsonFixtures.payload.get,
      resolve: expect.any(Function),
      resolved: expect.any(Promise),
      websocket: expect.any(MockedWebSocket),
    });

    await new Promise(
      (resolve) => (createdAndSubscribed.websocket.onopen = resolve)
    );

    expect(createdAndSubscribed.websocket.readyState).toEqual(
      createdAndSubscribed.websocket.OPEN
    );
    expect(await createdAndSubscribed.resolved).toMatchObject(
      jestFixtures.subscriptionUpdates.rejected
    );
    expect(wsEol).toEqual(
      expect.arrayContaining([createdAndSubscribed.websocket.readyState])
    );

    return;
  });

  it("should create, subscribe & resolve using using obj.resolve() method", async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.created));
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get));

    const payload =
      jestFixtures.validPayload as XummTypes.XummPostPayloadBodyJson;
    const createdAndSubscribed = await Sdk.payload.createAndSubscribe(payload);

    expect(createdAndSubscribed).toMatchObject({
      created: jestFixtures.createPayloadResponseObject,
      payload: jsonFixtures.payload.get,
      resolve: expect.any(Function),
      resolved: expect.any(Promise),
      websocket: expect.any(MockedWebSocket),
    });

    await new Promise(
      (resolve) => (createdAndSubscribed.websocket.onopen = resolve)
    );

    expect(createdAndSubscribed.websocket.readyState).toEqual(
      createdAndSubscribed.websocket.OPEN
    );

    let receivedWsMessages = 0;
    createdAndSubscribed.websocket.onmessage = () => receivedWsMessages++;

    setTimeout(() => {
      createdAndSubscribed.resolve({ dummyObject: true });
      expect(receivedWsMessages).toEqual(3);
    }, 500);

    expect(await createdAndSubscribed.resolved).toMatchObject({
      dummyObject: true,
    });
    expect(wsEol).toEqual(
      expect.arrayContaining([createdAndSubscribed.websocket.readyState])
    );

    return;
  });
});
