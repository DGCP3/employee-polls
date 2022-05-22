import { _createQuestion, _answerQuestion, _loginUser } from "../mock-api";
const SET_LOADING = "LOGIN_REQUEST";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_FAILURE = "LOGIN_FAILURE";
const LOG_OUT = "LOG_OUT";
const SET_QUESTIONS = "SET_QUESTIONS";
const SET_ANSWERS = "SET_ANSWERS";

const initialState = {
  isAuth: false,
  loading: false,
  error: null,
  user: null,
  questions: [],
  answers: {},
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuth: true,
        user: action.payload,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case LOG_OUT:
      return {
        ...state,
        isAuth: false,
        user: null,
        questions: [],
        answers: {},
      };
    case SET_QUESTIONS:
      return {
        ...state,
        loading: false,
        error: null,
        questions: [...state.questions, ...action.payload],
      };
    case SET_ANSWERS:
      return {
        ...state,
        answers: {
          ...state.answers,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
// action creator functions
const setLoading = () => ({ type: SET_LOADING });
const loginSuccess = (payload) => ({ type: LOGIN_SUCCESS, payload });
const loginFailure = (payload) => ({
  type: LOGIN_FAILURE,
  payload,
});
export const logout = () => ({
  type: LOG_OUT,
});

const setQuestions = (payload) => ({
  type: SET_QUESTIONS,
  payload,
});

const setAnswers = (payload) => ({
  type: SET_ANSWERS,
  payload,
});

// thunks
export const loginThunk = (username, password) => {
  return async (dispatch) => {
    dispatch(setLoading());
    try {
      const response = await _loginUser(username, password);
      if ("error" in response) throw new Error(response.error);
      const { answers, questions, ...rest } = response;
      dispatch(loginSuccess(rest));
      dispatch(setAnswers(answers));
      dispatch(setQuestions(questions));
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };
};

export const createQuestionThunk = (options) => {
  return async (dispatch, getState) => {
    try {
      const {
        user: { id },
      } = getState();
      const response = await _createQuestion(options, id);
      console.log(response);
      dispatch(setQuestions([response.id]));
    } catch (error) {
      console.error(error);
    }
  };
};

export const setAnswersThunk = (_answer) => {
  return async (dispatch, getState) => {
    try {
      const {
        answers,
        user: { id },
      } = getState();
      const response = await _answerQuestion(
        id,
        {
          answers: { ...answers, ..._answer },
        },
        Object.keys(_answer)[0]
      );
      dispatch(setAnswers(response?.answers));
    } catch (error) {
      console.log(error);
    }
  };
};