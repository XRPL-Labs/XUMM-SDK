export const pongObject = {
  application: {
    disabled: expect.any(Number),
    name: expect.any(String),
    uuidv4: expect.any(String),
    webhookurl: expect.any(String)
  },
  call: {
    uuidv4: expect.any(String)
  }
}

export const subscriptionUpdates = {
  welcome: {message: 'Welcome aaaaaaaa-dddd-ffff-cccc-8207bd724e45'},
  expire: {expires_in_seconds: 30000},
  opened: {opened: true},
  rejected: {
    payload_uuidv4: 'aaaaaaaa-dddd-ffff-cccc-8207bd724e45',
    reference_call_uuidv4: 'bbbbbbbb-eeee-aaaa-1111-8d192bd91f07',
    signed: false,
    user_token: true,
    return_url: {app: null, web: null},
    custom_meta: {}
  }
}

export const createPayloadResponseObject = {
  uuid: expect.any(String),
  next: {
    always: expect.any(String)
  },
  refs: {
    qr_png: expect.any(String),
    qr_matrix: expect.any(String),
    qr_uri_quality_opts: expect.any(Array),
    websocket_status: expect.any(String)
  },
  pushed: expect.any(Boolean)
}

export const cancelPayloadResponseObject = {
  result: {
    cancelled: true,
    reason: 'OK'
  },
  meta: {
    exists: true,
    uuid: expect.any(String),
    multisign: expect.any(Boolean),
    submit: expect.any(Boolean),
    destination: expect.any(String),
    resolved_destination: expect.any(String),
    resolved: expect.any(Boolean),
    signed: expect.any(Boolean),
    cancelled: expect.any(Boolean),
    expired: true,
    pushed: expect.any(Boolean),
    app_opened: expect.any(Boolean),
    return_url_app: expect.any(String),
    return_url_web: expect.any(String)
  }
}

export const validPayload = {
  txjson: {
    TransactionType: 'Payment',
    Destination: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
    DestinationTag: 495
  }
}

export const invalidPayload = {
  user_token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  txblob: '1200002400000003614000000002FAF0806840000000000000C8732' +
    '08536F6D65547970657D08536F6D6544617461E1EA7C09446576656C6F706' +
    '5727D0B4057696574736557696E64E1F1',
  txjson: {
    TransactionType : 'Payment',
    Destination : 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
    DestinationTag: 495,
    Amount: '65000'
  }
}
