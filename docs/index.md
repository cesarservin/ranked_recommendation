ranked_recommendation
==============
![ranked_recommendation_Logo.png](img/suggest_item.jpg)

## Usage
- **Basic Usage**: Run `ranked_recommendation.exe` or use `ranked_recommendation_main.ipynb`
- **Configuration**: Modify pyproject.toml to add or remove packages.

## Data
- **Sources**: The dataset is “The Instacart Online Grocery Shopping Dataset 2017”, Accessed from https://www.instacart.com/datasets/grocery-shopping-2017 on 12/3/2023.

The dataset “The Instacart Online Grocery Shopping Dataset 2017” is an anonymized dataset contains over 3 million grocery orders from more than 200,000 Instacart users.
For each user, Instacart provided between 4 and 100 of their orders, with the sequence of products purchased in each order. However, given the restriction of the assignment of 10MB. I have shrinked and modified the size of the dataset.

- **Structure**: Table of key features

!!! example
    Input data format

```
products
    product_id
    product_name
```
```
order_products
    order_id
    product_id
    add_to_cart_order
    reordered
```


## Result ✅

 - **Findings:**
   - Based on both rankings markov chains model and from the initial counts of sales they shown to be similar. 
   I was expecting the ranking of products to be different, however given that this is smaller dataset the results might change with the extended dataset.


- **Visualizations**:
  - ![Results](\img\rankingscomp.jpg)


## Directory Structure


    .
    ├── docs <- markdown files for mkdocs
    │   └── img <- assets
    ├── notebooks <- jupyter notebooks for exploratory analysis and explanation
    └── src - scripts for processing data eg. transformations, dataset merges etc.
    │   ├── data <- loading, saving and modelling your data
    │   ├── features <- feature engineering
    │   ├── model <- algorithms and models
    │   ├── plots <- plots
    │   └── utils <- api and other
    ├── LICENSE <- License
    ├── mkdocs.yml <- config for mkdocs
    ├── pyproject.yml <- config project
    └── README.md <- README file of the package

## Contributing

To contribute create a PR a use conventional [commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)

```
fix: <description>
feat: <description>
docs: <description>
refactor: <description>
```

**License**

The project is licensed under the MIT License.

I hope this is helpful!