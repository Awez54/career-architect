import sys
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import json

# Read the CSV file
df = pd.read_csv("./job_descriptions.csv")

# Extract the skills column from the DataFrame
skills_data = df["skills"].tolist()

# Initialize TF-IDF vectorizer
tfidf_vectorizer = TfidfVectorizer()

# Fit and transform the skills data
skills_vectors = tfidf_vectorizer.fit_transform(skills_data)

# Initialize KNN model
knn_model = NearestNeighbors(n_neighbors=5, metric='cosine')

# Fit the KNN model on the TF-IDF vectors
knn_model.fit(skills_vectors)

def recommend_jobs(user_skills):
    # Convert user input skills into TF-IDF vectors
    user_skills_vector = tfidf_vectorizer.transform([user_skills])

    # Find the nearest neighbors (job titles) for the user input skills
    distances, indices = knn_model.kneighbors(user_skills_vector)

    # Initialize a set to keep track of unique job titles
    unique_job_titles = set()

    # Initialize an empty list to store recommended jobs
    recommended_jobs = []

    # Loop through each nearest job title and its corresponding index
    for idx in indices[0]:
        # Get the job title for the current index
        job_title = df.iloc[idx]["Job Title"]

        # Check if the job title has not been encountered before
        if job_title not in unique_job_titles:
            # Add the job title to the set of unique job titles
            unique_job_titles.add(job_title)

            # Extract the skills required for the current job title
            required_skills = df.iloc[idx]["skills"]

            # Convert required skills to a set for efficient comparison
            required_skills_set = set(required_skills.split(', '))

            # Find the missing skills for the user
            missing_skills = required_skills_set - set(user_skills)

            # Retrieve the salary range for the current job title
            salary_range = df.iloc[idx]["Salary Range"]

            # Add job details to the recommended jobs list
            recommended_jobs.append({
                "Title": job_title,
                "Salary": salary_range,
                "Missing_Skills": list(missing_skills)
            })

    return recommended_jobs

if __name__ == "__main__":
    # Extract user skills from command-line arguments
    user_skills = ' '.join(sys.argv[1:])

    # Call the function to recommend jobs based on user skills
    recommended_jobs = recommend_jobs(user_skills)

    # Print recommended jobs as JSON array
    print(json.dumps(recommended_jobs))
