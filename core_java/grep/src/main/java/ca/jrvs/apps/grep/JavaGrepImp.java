package ca.jrvs.apps.grep;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JavaGrepImp implements JavaGrep {

    private String regex;
    private String rootPath;
    private String outFile;

    // compile regex once
    private Pattern pattern;

    @Override
    public void process() throws IOException {
        if (regex == null || rootPath == null || outFile == null) {
            throw new IllegalStateException("USAGE: JavaGrep <regex> <rootPath> <outFile>");
        }

        pattern = Pattern.compile(regex);

        List<File> files = listFiles(rootPath);

        List<String> matchedLines = new ArrayList<>();
        for (File file : files) {
            for (String line : readLines(file)) {
                if (containsPattern(line)) {
                    matchedLines.add(line);
                }
            }
        }

        writeToFile(matchedLines);
    }

    @Override
    public List<File> listFiles(String rootDir) {
        Path root = Paths.get(rootDir);
//        if (!Files.exists(root)) {
//            throw new IllegalArgumentException("Root path does not exist: " + rootDir);
//        }

        try (Stream<Path> paths = Files.walk(root)) {
            return paths
                    .filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Failed to traverse directory: " + rootDir, e);
        }
    }

    @Override
    public List<String> readLines(File inputFile) {
        if (inputFile == null || !inputFile.isFile()) {
            throw new IllegalArgumentException("inputFile must be a file: " + inputFile);
        }

        List<String> lines = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new FileInputStream(inputFile), StandardCharsets.UTF_8))) {

            String line;
            while ((line = br.readLine()) != null) {
                lines.add(line);
            }
            return lines;

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + inputFile.getAbsolutePath(), e);
        }
    }

    @Override
    public boolean containsPattern(String line) {
        if (line == null) return false;
        if (pattern == null) {
            pattern = Pattern.compile(regex);
        }
        return pattern.matcher(line).find();
    }

    @Override
    public void writeToFile(List<String> lines) throws IOException {
        if (outFile == null) {
            throw new IllegalStateException("outFile must be set before writeToFile()");
        }

        Path outPath = Paths.get(outFile);
        Path parent = outPath.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }

        try (BufferedWriter bw = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(outPath.toFile(), false), StandardCharsets.UTF_8))) {

            for (String line : lines) {
                bw.write(line);
                bw.newLine();
            }
        }
    }

    @Override
    public String getRootPath() {
        return rootPath;
    }

    @Override
    public void setRootPath(String rootPath) {
        this.rootPath = rootPath;
    }

    @Override
    public String getRegex() {
        return regex;
    }

    @Override
    public void setRegex(String regex) {
        this.regex = regex;
        this.pattern = null; // reset compiled pattern if regex changes
    }

    @Override
    public String getOutFile() {
        return outFile;
    }

    @Override
    public void setOutFile(String outFile) {
        this.outFile = outFile;
    }

    public static void main(String[] args) {
        if (args.length != 3) {
            throw new IllegalArgumentException("USAGE: JavaGrep <regex> <rootPath> <outFile>");
        }

        JavaGrepImp app = new JavaGrepImp();
        app.setRegex(args[0]);
        app.setRootPath(args[1]);
        app.setOutFile(args[2]);

        try {
            app.process();
        } catch (Exception ex) {
            throw new RuntimeException("Process failed to run", ex);
        }
    }
}
