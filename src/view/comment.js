import dayjs from 'dayjs';
import he from 'he';

const createCommentTemplate = (data) => {
  const {emotion, author, comment, date, id} = data;
  const comentsDate = dayjs(date).format('YYYY/MM/D mm:HH');

  return `<li class="film-details__comment" id='${id}'>
            <span class="film-details__comment-emoji">
              <img src="./images/emoji/${emotion}.png" width="55" height="55" alt="emoji-smile">
            </span>
            <div>
              <p class="film-details__comment-text">${he.encode(comment)}</p>
              <p class="film-details__comment-info">
                <span class="film-details__comment-author">${author}</span>
                <span class="film-details__comment-day">${comentsDate}</span>
                <button class="film-details__comment-delete">Delete</button>
              </p>
            </div>
          </li>`;
};

export default class CommentView {
  constructor(comment) {
    this._comment = comment;
    this._element = null;
  }

  getTemplate() {
    return createCommentTemplate(this._comment);
  }

  removeElement() {
    this._element = null;
  }
}
