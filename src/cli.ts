import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AgentLink } from './AgentLink';
import { MCPServerConfig } from './schema/mcp.schema';

const program = new Command();
const agentLink = new AgentLink();

program
  .name('agentlink')
  .description('Universal MCP config sync for AI coding agents')
  .version('0.1.0');

program.command('init')
  .description('Scaffold agentlink.json in cwd with smart defaults')
  .action(async () => {
    const spinner = ora('Initializing agentlink.json...').start();
    try {
      await agentLink.init();
      spinner.succeed(chalk.green('Successfully created agentlink.json!'));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('sync')
  .description('Sync agentlink.json to all detected agents')
  .option('--agents <agents>', 'Comma-separated list of agents to sync (e.g., claude,gemini)')
  .option('--dry-run', 'Show what would be synced without making changes')
  .action(async (options) => {
    const spinner = ora('Syncing config...').start();
    try {
      const agents = options.agents ? options.agents.split(',').map((a: string) => a.trim()) : undefined;
      const result = await agentLink.sync({ agents, dryRun: options.dryRun });
      spinner.succeed(chalk.green('Sync complete!'));
      
      if (result.synced.length > 0) {
        console.log(chalk.green(`\nSynced to: ${result.synced.join(', ')}`));
      }
      if (result.failed.length > 0) {
        console.log(chalk.red(`Failed to sync: ${result.failed.join(', ')}`));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('add <server-name>')
  .description('Prompt for config, add to agentlink.json and sync')
  .option('--command <cmd>', 'Command to run')
  .option('--args <args>', 'Comma-separated arguments')
  .action(async (name, options) => {
    const spinner = ora(`Adding server '${name}'...`).start();
    try {
      if (!options.command) throw new Error('--command is required');
      const config: MCPServerConfig = { command: options.command };
      if (options.args) config.args = options.args.split(',').map((a: string) => a.trim());
      
      await agentLink.addServer(name, config);
      await agentLink.sync();
      spinner.succeed(chalk.green(`Server '${name}' added and synced!`));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('remove <server-name>')
  .description('Remove MCP server and sync')
  .action(async (name) => {
    const spinner = ora(`Removing server '${name}'...`).start();
    try {
      await agentLink.removeServer(name);
      await agentLink.sync();
      spinner.succeed(chalk.green(`Server '${name}' removed and synced!`));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('list')
  .description('List all configured MCP servers in agentlink.json')
  .action(async () => {
    try {
      const servers = await agentLink.listServers();
      const keys = Object.keys(servers);
      if (keys.length === 0) {
        console.log(chalk.yellow('No servers configured in agentlink.json.'));
        return;
      }
      console.log(chalk.cyan('\nConfigured MCP Servers:\n'));
      for (const key of keys) {
        console.log(chalk.green(`- ${key}:`), chalk.dim(servers[key].command));
      }
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('status')
  .description('Show which agents are detected and their config paths')
  .action(async () => {
    try {
      const installed = await agentLink.detectAgents();
      console.log(chalk.cyan('\nDetected Agents:\n'));
      
      const tableData: any = {};
      const allAgents = ['claude', 'gemini', 'opencode', 'codex'];
      const installedNames = installed.map(a => a.name);
      
      for (const agent of allAgents) {
        const isInstalled = installedNames.includes(agent);
        const info = installed.find(a => a.name === agent);
        tableData[agent] = {
          Detected: isInstalled ? chalk.green('Yes') : chalk.red('No'),
          Path: info ? chalk.dim(info.configPath) : chalk.dim('N/A')
        };
      }
      
      console.table(tableData);
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('pull')
  .description('Use an agent\'s existing config as source of truth')
  .requiredOption('--from <agent>', 'Agent name to pull from (e.g., claude)')
  .action(async (options) => {
    const spinner = ora(`Pulling config from ${options.from}...`).start();
    try {
      await agentLink.pull(options.from);
      spinner.succeed(chalk.green(`Successfully pulled config from ${options.from} to agentlink.json!`));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('diff')
  .description('Show config differences between all agents')
  .action(async () => {
    try {
      const diffs = await agentLink.diff();
      let hasChanges = false;
      for (const [agent, diff] of Object.entries(diffs)) {
        if (diff.hasChanges) {
          hasChanges = true;
          console.log(chalk.cyan(`\nDiff for ${agent}:`));
          diff.added.forEach(a => console.log(chalk.green(`+ Added: ${a}`)));
          diff.removed.forEach(r => console.log(chalk.red(`- Removed: ${r}`)));
          diff.modified.forEach(m => console.log(chalk.yellow(`~ Modified: ${m}`)));
        }
      }
      if (!hasChanges) {
        console.log(chalk.green('All agent configs are in sync with agentlink.json!'));
      }
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
