import Abstarct from './abstract.js';

const createCardContainerTemplate = () => (
  `<section class="films">
    <section class="films-list">
      <div class="films-list__container">
      </div>
    </section>
  </section>`
);

export default class SiteContent extends Abstarct {
  getTemplate() {
    return createCardContainerTemplate();
  }
}

