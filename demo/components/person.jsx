/** @jsx React.DOM */

var departmentActionMapping = {
  directing: 'directing',
  writing: 'writing',
  production: 'producing',
  acting: 'acting in'
};

Cosmos.components.Person = React.createClass({
  /**
   * Expected input:
   * {
   *   component: "Person",
   *   id: 525
   * }
   * Expected state:
   * {
   *   data: {
   *     id: 525,
   *     name: "Christopher Nolan",
   *     birthday: "1970-07-30",
   *     place_of_birth: "London, England, UK",
   *     profile_path: "/7OGmfDF4VHLLgbjxuEwTj3ga0uQ.jpg",
   *     biography: "Christopher Jonathan James Nolan is a British/American...",
   *     credits: {
   *       crew: [...],
   *       cast: [...]
   *     }
   *     imdb_id: "nm0634240"
   *   }
   * }
   */
  mixins: [Cosmos.mixins.DataFetch,
           Cosmos.mixins.PersistState],
  render: function() {
    if (_.isEmpty(this.state.data)) {
      return (<div className="movie"></div>);
    }
    var groupedCredits =
          App.groupCreditsPerDepartments(this.state.data.movie_credits),
        relevantDepartment = this.getRelevantDepartment(groupedCredits),
        relevantCredits = groupedCredits[relevantDepartment];
    return (
      <div className="person">
        <Cosmos component="PersonHeader"
                name={this.state.data.name}
                profilePath={App.getImagePath(this.state.data.profile_path, 342)}
                birthday={App.getBirthDay(this.state.data.birthday)}
                birthplace={this.state.data.place_of_birth} />
        <p className="overview">
          <em>{App.getTextExcerpt(this.state.data.biography, 600)}</em>
        </p>
        <div className="related">
          <p className="related-headline">
            <em>{this.state.data.name}</em> is best known for
            {departmentActionMapping[relevantDepartment]}...
          </p>
          <Cosmos component="List"
                  state={{data: this.getPropsForRelevantCredits(relevantCredits)}} />
        </div>
      </div>
    );
  },
  getDataUrl: function(props) {
    return App.getApiPath('person', props.id, 'movie_credits');
  },
  getPropsForRelevantCredits: function(relevantCredits) {
    return _.map(relevantCredits, function(movie) {
      return {
        component: "Thumbnail",
        name: movie.title + ' (' + App.getReleaseYear(movie.release_date) + ')',
        image: App.getImagePath(movie.poster_path, 154),
        linkProps: {
          component: "Movie",
          id: movie.id
        }
      };
    }.bind(this));
  },
  getRelevantDepartment: function(groupedCredits) {
    var departments = _.keys(groupedCredits);
    // Pick this person's most relevant department by selecting the one
    // that contains the most entries
    return _.sortBy(departments, function(department) {
      return -groupedCredits[department].length;
    })[0];
  }
});
