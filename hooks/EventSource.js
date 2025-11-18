/**
 * EventSource(SSE) 모듈
 */
const EventSource = async ({ jobId, lastEventId }) => {
  const accessToken = await AsyncStorage.getItem("accessToken");
  const header = `Bearer ${accessToken}`;

  const options = {
    headers: {
      Authorization: header,
      ...(lastEventId && { "Last-Event-ID": lastEventId }),
    },
    query: { jobId },
  };

  const eventSource = new NativeEventSource(
    "https://tkv00.ddns.net/api/progress/subscribe",
    options
  );
};

export default EventSource;
