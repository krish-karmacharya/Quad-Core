const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = {
  uploadReport: async ({ imageFile, location, description }) => {
    await delay(1000);

    return {
      ok: true,
      report: {
        id: Date.now().toString(),
        imageUrl: imageFile
          ? URL.createObjectURL(imageFile)
          : 'https://via.placeholder.com/300',
        location,
        description,
      },
    };
  },

  analyzeWithAI: async ({ imageUrl, location, description }) => {
    await delay(1000);

    return {
      analysis: {
        category: 'Infrastructure Issue',
        severity: 'Medium',
        recommendedAction: 'Review and assign to local authority',
        notes: `Mock AI analysis for report at ${location || 'unknown location'}.`,
      },
    };
  },
};

export default api;