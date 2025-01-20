class BlogPredictiveSearch extends PredictiveSearch {
  constructor() {
    super();
    console.log('BlogPredictiveSearch init')
  }
}

customElements.define('blog-predictive-search', BlogPredictiveSearch);
