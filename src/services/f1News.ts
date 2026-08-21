import { MotorsportNewsService } from './motorsportNews';

export const F1NewsService = {
  async fetchLatestNews() {
    return MotorsportNewsService.fetchLatestNews();
  },
};
