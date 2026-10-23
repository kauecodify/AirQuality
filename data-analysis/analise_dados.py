#!/usr/bin/env python3
"""
AirQuality Monitor - Análise de Dados
Script Python para análise estatística dos dados de qualidade do ar

Este script lê dados exportados em CSV, calcula estatísticas e gera gráficos.
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional


class AirQualityAnalyzer:
    """Classe para análise de dados de qualidade do ar."""
    
    def __init__(self, csv_path: str = None):
        """
        Inicializa o analisador de dados.
        
        Args:
            csv_path: Caminho para o arquivo CSV com os dados
        """
        self.csv_path = csv_path
        self.data = None
        self.df = None
        
    def load_data(self, csv_path: str = None) -> bool:
        """
        Carrega os dados do arquivo CSV.
        
        Args:
            csv_path: Caminho para o arquivo CSV (opcional, usa self.csv_path se None)
            
        Returns:
            bool: True se os dados foram carregados com sucesso, False caso contrário
        """
        path = csv_path or self.csv_path
        
        if not path:
            print("Erro: Nenhum caminho para o arquivo CSV fornecido.")
            return False
            
        if not os.path.exists(path):
            print(f"Erro: Arquivo não encontrado: {path}")
            return False
            
        try:
            # Carregar dados do CSV
            self.df = pd.read_csv(path)
            
            # Converter coluna de data/hora para datetime
            if 'dataHora' in self.df.columns:
                self.df['dataHora'] = pd.to_datetime(self.df['dataHora'])
            elif 'createdAt' in self.df.columns:
                self.df['dataHora'] = pd.to_datetime(self.df['createdAt'])
            else:
                print("Aviso: Coluna de data/hora não encontrada. Usando índice como data.")
                self.df['dataHora'] = pd.to_datetime(self.df.index)
                
            # Verificar colunas necessárias
            required_columns = ['co2', 'umidade', 'temperatura']
            missing_columns = [col for col in required_columns if col not in self.df.columns]
            
            if missing_columns:
                print(f"Erro: Colunas ausentes no CSV: {', '.join(missing_columns)}")
                return False
                
            self.data = self.df
            print(f"Dados carregados com sucesso: {len(self.df)} registros")
            return True
            
        except Exception as e:
            print(f"Erro ao carregar dados: {e}")
            return False
            
    def validate_data(self) -> Tuple[bool, List[str]]:
        """
        Valida os dados carregados.
        
        Returns:
            Tuple[bool, List[str]]: (is_valid, errors)
        """
        if self.df is None:
            return False, ["Nenhum dado carregado"]
            
        errors = []
        
        # Verificar valores nulos
        null_counts = self.df[['co2', 'umidade', 'temperatura']].isnull().sum()
        for col, count in null_counts.items():
            if count > 0:
                errors.append(f"{count} valores nulos na coluna {col}")
                
        # Verificar valores fora do intervalo esperado
        co2_invalid = self.df[(self.df['co2'] < 0) | (self.df['co2'] > 5000)]
        if len(co2_invalid) > 0:
            errors.append(f"{len(co2_invalid)} valores de CO2 fora do intervalo [0, 5000]")
            
        umidade_invalid = self.df[(self.df['umidade'] < 0) | (self.df['umidade'] > 100)]
        if len(umidade_invalid) > 0:
            errors.append(f"{len(umidade_invalid)} valores de umidade fora do intervalo [0, 100]")
            
        temperatura_invalid = self.df[(self.df['temperatura'] < -50) | (self.df['temperatura'] > 100)]
        if len(temperatura_invalid) > 0:
            errors.append(f"{len(temperatura_invalid)} valores de temperatura fora do intervalo [-50, 100]")
            
        return len(errors) == 0, errors
        
    def calculate_statistics(self) -> Dict[str, dict]:
        """
        Calcula estatísticas para todas as variáveis.
        
        Returns:
            Dict[str, dict]: Dicionário com estatísticas para cada variável
        """
        if self.df is None:
            return {}
            
        statistics = {}
        
        for column in ['co2', 'umidade', 'temperatura']:
            if column in self.df.columns:
                data = self.df[column].dropna()
                
                statistics[column] = {
                    'count': len(data),
                    'mean': float(data.mean()),
                    'median': float(data.median()),
                    'std': float(data.std()),
                    'min': float(data.min()),
                    'max': float(data.max()),
                    'q1': float(data.quantile(0.25)),
                    'q3': float(data.quantile(0.75)),
                    'range': float(data.max() - data.min())
                }
                
        return statistics
        
    def calculate_daily_statistics(self) -> Dict[str, dict]:
        """
        Calcula estatísticas por dia da semana.
        
        Returns:
            Dict[str, dict]: Dicionário com estatísticas por dia da semana
        """
        if self.df is None or 'dataHora' not in self.df.columns:
            return {}
            
        # Adicionar coluna com o dia da semana
        self.df['dia_semana'] = self.df['dataHora'].dt.day_name()
        
        # Traduzir nomes dos dias para português
        day_translation = {
            'Monday': 'Segunda-feira',
            'Tuesday': 'Terça-feira',
            'Wednesday': 'Quarta-feira',
            'Thursday': 'Quinta-feira',
            'Friday': 'Sexta-feira',
            'Saturday': 'Sábado',
            'Sunday': 'Domingo'
        }
        self.df['dia_semana'] = self.df['dia_semana'].map(day_translation)
        
        daily_stats = {}
        
        for day in day_translation.values():
            day_data = self.df[self.df['dia_semana'] == day]
            
            if len(day_data) == 0:
                continue
                
            daily_stats[day] = {
                'count': len(day_data),
                'co2': {
                    'mean': float(day_data['co2'].mean()),
                    'median': float(day_data['co2'].median()),
                    'min': float(day_data['co2'].min()),
                    'max': float(day_data['co2'].max())
                },
                'umidade': {
                    'mean': float(day_data['umidade'].mean()),
                    'median': float(day_data['umidade'].median()),
                    'min': float(day_data['umidade'].min()),
                    'max': float(day_data['umidade'].max())
                },
                'temperatura': {
                    'mean': float(day_data['temperatura'].mean()),
                    'median': float(day_data['temperatura'].median()),
                    'min': float(day_data['temperatura'].min()),
                    'max': float(day_data['temperatura'].max())
                }
            }
            
        return daily_stats
        
    def find_peaks(self, threshold_percentile: float = 95.0) -> Dict[str, List[dict]]:
        """
        Encontra picos nos dados acima de um percentil.
        
        Args:
            threshold_percentile: Percentil para definir pico
            
        Returns:
            Dict[str, List[dict]]: Dicionário com picos para cada variável
        """
        if self.df is None:
            return {}
            
        peaks = {}
        
        for column in ['co2', 'umidade', 'temperatura']:
            if column not in self.df.columns:
                continue
                
            # Calcular percentil
            threshold = self.df[column].quantile(threshold_percentile / 100)
            
            # Encontrar picos
            peak_data = self.df[self.df[column] >= threshold]
            
            peaks[column] = []
            for _, row in peak_data.iterrows():
                peaks[column].append({
                    'value': float(row[column]),
                    'date': row['dataHora'].strftime('%Y-%m-%d %H:%M:%S') if pd.notna(row['dataHora']) else None,
                    'index': int(row.name) if isinstance(row.name, (int, np.integer)) else str(row.name)
                })
                
        return peaks
        
    def generate_boxplot(self, output_path: str = 'boxplot_qualidade_ar.png') -> bool:
        """
        Gera gráfico boxplot para todas as variáveis.
        
        Args:
            output_path: Caminho para salvar o gráfico
            
        Returns:
            bool: True se o gráfico foi gerado com sucesso
        """
        if self.df is None:
            print("Erro: Nenhum dado para gerar gráfico.")
            return False
            
        try:
            # Configurar estilo
            plt.style.use('seaborn-v0_8')
            
            # Criar figura
            fig, axes = plt.subplots(1, 3, figsize=(18, 6))
            fig.suptitle('Boxplot - Dados de Qualidade do Ar', fontsize=16, fontweight='bold')
            
            # Boxplot para CO2
            axes[0].boxplot(self.df['co2'].dropna(), patch_artist=True)
            axes[0].set_title('Níveis de CO₂ (ppm)')
            axes[0].set_ylabel('CO₂ (ppm)')
            axes[0].grid(True, alpha=0.3)
            
            # Boxplot para Umidade
            axes[1].boxplot(self.df['umidade'].dropna(), patch_artist=True)
            axes[1].set_title('Umidade (%)')
            axes[1].set_ylabel('Umidade (%)')
            axes[1].grid(True, alpha=0.3)
            
            # Boxplot para Temperatura
            axes[2].boxplot(self.df['temperatura'].dropna(), patch_artist=True)
            axes[2].set_title('Temperatura (°C)')
            axes[2].set_ylabel('Temperatura (°C)')
            axes[2].grid(True, alpha=0.3)
            
            # Ajustar layout
            plt.tight_layout()
            
            # Salvar gráfico
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"Gráfico boxplot salvo em: {output_path}")
            
            # Fechar figura
            plt.close(fig)
            
            return True
            
        except Exception as e:
            print(f"Erro ao gerar gráfico boxplot: {e}")
            return False
            
    def generate_time_series_plot(self, output_path: str = 'series_temporal.png') -> bool:
        """
        Gera gráfico de série temporal para todas as variáveis.
        
        Args:
            output_path: Caminho para salvar o gráfico
            
        Returns:
            bool: True se o gráfico foi gerado com sucesso
        """
        if self.df is None or 'dataHora' not in self.df.columns:
            print("Erro: Nenhum dado ou data/hora para gerar gráfico de série temporal.")
            return False
            
        try:
            # Configurar estilo
            plt.style.use('seaborn-v0_8')
            
            # Criar figura
            fig, axes = plt.subplots(3, 1, figsize=(14, 12))
            fig.suptitle('Série Temporal - Dados de Qualidade do Ar', fontsize=16, fontweight='bold')
            
            # Gráfico para CO2
            axes[0].plot(self.df['dataHora'], self.df['co2'], color='tab:blue', alpha=0.7)
            axes[0].set_title('Níveis de CO₂ ao Longo do Tempo')
            axes[0].set_ylabel('CO₂ (ppm)')
            axes[0].grid(True, alpha=0.3)
            axes[0].tick_params(axis='x', rotation=45)
            
            # Gráfico para Umidade
            axes[1].plot(self.df['dataHora'], self.df['umidade'], color='tab:green', alpha=0.7)
            axes[1].set_title('Umidade ao Longo do Tempo')
            axes[1].set_ylabel('Umidade (%)')
            axes[1].grid(True, alpha=0.3)
            axes[1].tick_params(axis='x', rotation=45)
            
            # Gráfico para Temperatura
            axes[2].plot(self.df['dataHora'], self.df['temperatura'], color='tab:red', alpha=0.7)
            axes[2].set_title('Temperatura ao Longo do Tempo')
            axes[2].set_ylabel('Temperatura (°C)')
            axes[2].grid(True, alpha=0.3)
            axes[2].tick_params(axis='x', rotation=45)
            
            # Ajustar layout
            plt.tight_layout()
            
            # Salvar gráfico
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"Gráfico de série temporal salvo em: {output_path}")
            
            # Fechar figura
            plt.close(fig)
            
            return True
            
        except Exception as e:
            print(f"Erro ao gerar gráfico de série temporal: {e}")
            return False
            
    def generate_correlation_matrix(self, output_path: str = 'matriz_correlacao.png') -> bool:
        """
        Gera matriz de correlação entre as variáveis.
        
        Args:
            output_path: Caminho para salvar o gráfico
            
        Returns:
            bool: True se o gráfico foi gerado com sucesso
        """
        if self.df is None:
            print("Erro: Nenhum dado para gerar matriz de correlação.")
            return False
            
        try:
            # Calcular matriz de correlação
            corr_matrix = self.df[['co2', 'umidade', 'temperatura']].corr()
            
            # Criar figura
            fig, ax = plt.subplots(figsize=(8, 6))
            
            # Criar heatmap
            im = ax.imshow(corr_matrix, cmap='coolwarm', vmin=-1, vmax=1)
            
            # Adicionar valores
            for i in range(len(corr_matrix.columns)):
                for j in range(len(corr_matrix.columns)):
                    text = ax.text(j, i, f'{corr_matrix.iloc[i, j]:.2f}',
                                 ha='center', va='center', color='black', fontsize=12)
            
            # Configurar
            ax.set_title('Matriz de Correlação - Variáveis de Qualidade do Ar', fontsize=14, fontweight='bold')
            ax.set_xticks(range(len(corr_matrix.columns)))
            ax.set_yticks(range(len(corr_matrix.columns)))
            ax.set_xticklabels(corr_matrix.columns)
            ax.set_yticklabels(corr_matrix.columns)
            
            # Adicionar barra de cores
            fig.colorbar(im, ax=ax)
            
            # Ajustar layout
            plt.tight_layout()
            
            # Salvar gráfico
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"Matriz de correlação salva em: {output_path}")
            
            # Fechar figura
            plt.close(fig)
            
            return True
            
        except Exception as e:
            print(f"Erro ao gerar matriz de correlação: {e}")
            return False
            
    def generate_report(self, output_path: str = 'relatorio_analise.txt') -> bool:
        """
        Gera relatório completo da análise.
        
        Args:
            output_path: Caminho para salvar o relatório
            
        Returns:
            bool: True se o relatório foi gerado com sucesso
        """
        if self.df is None:
            print("Erro: Nenhum dado para gerar relatório.")
            return False
            
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                # Cabeçalho
                f.write("=" * 80 + "\n")
                f.write("RELATÓRIO DE ANÁLISE DE QUALIDADE DO AR\n")
                f.write("=" * 80 + "\n\n")
                
                # Data e hora do relatório
                f.write(f"Data do Relatório: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                # Informações básicas
                f.write("INFORMAÇÕES BÁSICAS\n")
                f.write("-" * 40 + "\n")
                f.write(f"Total de registros analisados: {len(self.df)}\n")
                f.write(f"Período: {self.df['dataHora'].min()} a {self.df['dataHora'].max()}\n\n")
                
                # Estatísticas gerais
                f.write("ESTATÍSTICAS GERAIS\n")
                f.write("-" * 40 + "\n")
                
                statistics = self.calculate_statistics()
                for var, stats in statistics.items():
                    f.write(f"\n{var.upper()}:\n")
                    f.write(f"  Contagem: {stats['count']}\n")
                    f.write(f"  Média: {stats['mean']:.2f}\n")
                    f.write(f"  Mediana: {stats['median']:.2f}\n")
                    f.write(f"  Desvio Padrão: {stats['std']:.2f}\n")
                    f.write(f"  Mínimo: {stats['min']:.2f}\n")
                    f.write(f"  Máximo: {stats['max']:.2f}\n")
                    f.write(f"  Primeiro Quartil: {stats['q1']:.2f}\n")
                    f.write(f"  Terceiro Quartil: {stats['q3']:.2f}\n")
                    f.write(f"  Amplitude: {stats['range']:.2f}\n")
                
                # Picos
                f.write("\n\nPICO REGISTRADOS\n")
                f.write("-" * 40 + "\n")
                peaks = self.find_peaks(threshold_percentile=95)
                for var, peak_list in peaks.items():
                    if peak_list:
                        f.write(f"\n{var.upper()} - Picos acima do percentil 95:\n")
                        for peak in peak_list[:5]:  # Mostrar os 5 maiores picos
                            f.write(f"  Valor: {peak['value']:.2f}, Data: {peak['date']}\n")
                    else:
                        f.write(f"\n{var.upper()}: Nenhum pico encontrado\n")
                
                # Análise por dia da semana
                f.write("\n\nANÁLISE POR DIA DA SEMANA\n")
                f.write("-" * 40 + "\n")
                daily_stats = self.calculate_daily_statistics()
                for day, stats in daily_stats.items():
                    f.write(f"\n{day}:\n")
                    f.write(f"  Número de leituras: {stats['count']}\n")
                    f.write(f"  CO₂ - Média: {stats['co2']['mean']:.2f}, Máximo: {stats['co2']['max']:.2f}\n")
                    f.write(f"  Umidade - Média: {stats['umidade']['mean']:.2f}, Máximo: {stats['umidade']['max']:.2f}\n")
                    f.write(f"  Temperatura - Média: {stats['temperatura']['mean']:.2f}, Máximo: {stats['temperatura']['max']:.2f}\n")
                
                # Validação dos dados
                f.write("\n\nVALIDAÇÃO DOS DADOS\n")
                f.write("-" * 40 + "\n")
                is_valid, errors = self.validate_data()
                if is_valid:
                    f.write("✓ Todos os dados estão válidos\n")
                else:
                    f.write("✗ Problemas encontrados:\n")
                    for error in errors:
                        f.write(f"  - {error}\n")
                
                # Rodapé
                f.write("\n" + "=" * 80 + "\n")
                f.write("FIM DO RELATÓRIO\n")
                f.write("=" * 80 + "\n")
            
            print(f"Relatório salvo em: {output_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao gerar relatório: {e}")
            return False
            
    def print_summary(self):
        """
        Imprime um resumo da análise no terminal.
        """
        if self.df is None:
            print("Erro: Nenhum dado para imprimir resumo.")
            return
            
        print("\n" + "=" * 80)
        print("RESUMO DA ANÁLISE DE QUALIDADE DO AR")
        print("=" * 80 + "\n")
        
        # Informações básicas
        print("INFORMAÇÕES BÁSICAS")
        print("-" * 40)
        print(f"Total de registros: {len(self.df)}")
        if 'dataHora' in self.df.columns:
            print(f"Período: {self.df['dataHora'].min()} a {self.df['dataHora'].max()}")
        print()
        
        # Estatísticas
        print("ESTATÍSTICAS")
        print("-" * 40)
        
        statistics = self.calculate_statistics()
        for var, stats in statistics.items():
            print(f"\n{var.upper()}:")
            print(f"  Média: {stats['mean']:.2f}")
            print(f"  Máximo: {stats['max']:.2f}")
            print(f"  Mínimo: {stats['min']:.2f}")
            print(f"  Desvio Padrão: {stats['std']:.2f}")
        
        # Picos
        print("\n\nPICO REGISTRADOS")
        print("-" * 40)
        peaks = self.find_peaks(threshold_percentile=95)
        for var, peak_list in peaks.items():
            if peak_list:
                print(f"\n{var.upper()} - Maior pico:")
                print(f"  Valor: {peak_list[0]['value']:.2f}")
                print(f"  Data: {peak_list[0]['date']}")
        
        # Análise por dia da semana
        print("\n\nANÁLISE POR DIA DA SEMANA")
        print("-" * 40)
        daily_stats = self.calculate_daily_statistics()
        for day, stats in daily_stats.items():
            print(f"\n{day}:")
            print(f"  Leituras: {stats['count']}")
            print(f"  CO₂ médio: {stats['co2']['mean']:.2f}")
            print(f"  Umidade média: {stats['umidade']['mean']:.2f}")
            print(f"  Temperatura média: {stats['temperatura']['mean']:.2f}")
        
        # Validação
        print("\n\nVALIDAÇÃO")
        print("-" * 40)
        is_valid, errors = self.validate_data()
        if is_valid:
            print("✓ Todos os dados estão válidos")
        else:
            print("✗ Problemas encontrados:")
            for error in errors:
                print(f"  - {error}")
        
        print("\n" + "=" * 80)


def main():
    """
    Função principal.
    """
    # Verificar se o arquivo CSV foi fornecido
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    else:
        # Tentar usar o arquivo padrão
        csv_path = 'dados_qualidade_ar.csv'
        if not os.path.exists(csv_path):
            print("Uso: python analise_dados.py <caminho_para_csv>")
            print("Ou coloque o arquivo 'dados_qualidade_ar.csv' no mesmo diretório.")
            sys.exit(1)
    
    # Criar analisador
    analyzer = AirQualityAnalyzer(csv_path)
    
    # Carregar dados
    if not analyzer.load_data():
        sys.exit(1)
    
    # Validar dados
    is_valid, errors = analyzer.validate_data()
    if not is_valid:
        print("\nAviso: Problemas encontrados nos dados:")
        for error in errors:
            print(f"  - {error}")
        print("\nContinuando com a análise...\n")
    
    # Imprimir resumo
    analyzer.print_summary()
    
    # Gerar relatório
    analyzer.generate_report()
    
    # Gerar gráficos
    analyzer.generate_boxplot()
    analyzer.generate_time_series_plot()
    analyzer.generate_correlation_matrix()
    
    print("\nAnálise concluída com sucesso!")


if __name__ == '__main__':
    main()
