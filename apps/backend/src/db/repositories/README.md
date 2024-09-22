# Database repositories

This directory contains the database repositories. Each repository is responsible for a specific entity in the database.

Services would use and combine these repositories to perform operations on the database.

You should not use repositories in a controller. Instead, use services to implement the behavior you need using the 
repositories.
