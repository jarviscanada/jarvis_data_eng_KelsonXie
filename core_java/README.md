# Introduction
Built an app that recursively scans a directory, reads its text files, and filters lines that match a given regex. 
It's coded in core Java, uses Maven as a project management tool and Java Stream API with lambda expressions to
process files and lines in a functional, declarative style. The project was written in IntelliJ, compiled and packaged
into a JAR file using Maven and containerized in Docker. The app is then pushed to Docker Hub for portable, reproducible execution

# Quick Start
1. Pull the Docker image from Docker Hub
```
docker pull kelsonxie/grep
```
2. Prepare input and output directories
```
mkdir data log
```
3. Run the grep app in a Docker container
```
docker run --rm \
-v $(pwd)/data:/data \
-v $(pwd)/log:/log \
kelsonxie/grep "regex_pattern" /data /log/grep.out
```

# Implemenation
## Pseudocode
```
process():
    validate inputs
    compile regex

    matchedLines =
        listFiles(rootPath)
            .stream()
            .flatMap(file -> readLines(file).stream())
            .filter(line -> line matches regex)
            .collect to list

    write matchedLines to outFile
```

## Performance Issue
The current implementation loads all matched lines into a list before writing, which can cause high memory usage for large directories. 
By using the Java Stream API, turning the file lines into a stream and allowing the grep app to process and write matches incrementally.
This will reduce peak memory usage for large files and directories

# Test
I prepared a sample dataset with multiple text files containing known patterns and edge cases (empty files, large files, and files without matches). 
I ran the application with different regex patterns and directory paths, then manually verified the output file by comparing matched lines against expected results using standard Linux tools

# Deployment
I dockerized the app by packaging it into a runnable JAR with Maven (mvn clean package), then creating a Dockerfile that uses a lightweight Java runtime base image (amazoncorretto:8-alpine). 
The Docker image copies the JAR into the container and sets an ENTRYPOINT to run java -jar grep.jar. 
This makes distribution easy because anyone can pull the image from Docker Hub and run it with volume mounts for input/output, without installing Java or Maven locally.

# Improvement
1. Include more rigorous unit testing and logging
2. Implement parallel streams for faster and more efficient memory performance
3. Implement options the CLI grep has such as -c or -L
