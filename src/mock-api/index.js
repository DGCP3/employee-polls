import {
  __getQuestion,
  __getQuestions,
  __getUser,
  __getUsers,
  __patchQuestion,
  __patchUser,
  __postQuestion,
} from "./api";
export const _loginUser = async (_username, _password) => {
  const res = await __getUser(_username);
  if (!res || res.password !== _password)
    return { error: "email or password is incorrect" };
  return res;
};

export const _createQuestion = async (_options, _author) => {
  const formattedQuestion = formatQuestion({
    optionOneText: _options.optionOne,
    optionTwoText: _options.optionTwo,
    author: _author,
  });
  const res = await __postQuestion(formattedQuestion);
  return res;
};

export const _getQuestions = async () => {
  const res = await __getQuestions();
  if (res) return res;
  return { error: "could not get questions" };
};

export const _answerQuestion = async (_userId, _answers, _qid) => {
  // patch user data with new answer data
  const response = await __patchUser(_userId, _answers);
  // patch question data with new answer data
  const question = await __getQuestion(_qid);
  if (question.optionOne.votes.includes(_userId)) {
    question.optionOne.votes.splice(
      question.optionOne.votes.indexOf(_userId),
      1
    );
    question.optionTwo.votes.push(_userId);
  } else {
    question.optionTwo.votes.splice(
      question.optionTwo.votes.indexOf(_userId),
      1
    );
    question.optionOne.votes.push(_userId);
  }
  await __patchQuestion(_qid, question);
  return response;
};

export const _getLeaderboard = async () => {
  const res = await __getUsers();
  const status = res.map((user) => {
    return {
      id: user.id,
      name: user.name,
      avatarURL: user.avatarURL,
      answers: Object.keys(user.answers).length,
      questions: user.questions.length,
    };
  });
  return status;
};

function formatQuestion({ optionOneText, optionTwoText, author }) {
  return {
    timestamp: Date.now(),
    author,
    optionOne: {
      votes: [],
      text: optionOneText,
    },
    optionTwo: {
      votes: [],
      text: optionTwoText,
    },
  };
}