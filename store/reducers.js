const initialState = {
  authToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiLrrLjqt5zruYgiLCJzb2NpYWxJZCI6IjIzNzMwMzQ1NDUiLCJpZCI6MzYsImV4cCI6MTAwMDAwMTY1OTUyMTE3MX0.TpoLa1BVhok0MfLU38xukzlcwwAGMXYJaogrmeOLcs7A4iNOFQ7oqbGWO8KAsmsEKKhD8JqwcLA20A8GYg2hMA",
  // eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiLrrLjqt5zruYgiLCJzb2NpYWxJZCI6IjIzNzMwMzQ1NDUiLCJpZCI6MzYsImV4cCI6MTAwMDAwMTY1OTUyMTE3MX0.TpoLa1BVhok0MfLU38xukzlcwwAGMXYJaogrmeOLcs7A4iNOFQ7oqbGWO8KAsmsEKKhD8JqwcLA20A8GYg2hMA
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        authToken: action.payload,
      };
    case "LOGOUT":
      return {
        ...initialState,
      };
    default:
      return state;
  }
};
